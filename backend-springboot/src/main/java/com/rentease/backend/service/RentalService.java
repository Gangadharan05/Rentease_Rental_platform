package com.rentease.backend.service;

import com.rentease.backend.dto.request.CheckoutRequest;
import com.rentease.backend.dto.request.ExtendRentalRequest;
import com.rentease.backend.dto.request.RentalStatusUpdateRequest;
import com.rentease.backend.dto.response.RentalResponse;
import com.rentease.backend.entity.Product;
import com.rentease.backend.entity.Rental;
import com.rentease.backend.entity.ServiceArea;
import com.rentease.backend.entity.User;
import com.rentease.backend.entity.enums.RentalStatus;
import com.rentease.backend.exception.ApiException;
import com.rentease.backend.repository.ProductRepository;
import com.rentease.backend.repository.RentalRepository;
import com.rentease.backend.repository.ServiceAreaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RentalService {

    private static final Set<RentalStatus> TERMINAL_STATUSES = Set.of(RentalStatus.COMPLETED, RentalStatus.CANCELLED);

    private final RentalRepository rentalRepository;
    private final ProductRepository productRepository;
    private final ServiceAreaRepository serviceAreaRepository;

    public RentalService(RentalRepository rentalRepository, ProductRepository productRepository,
                          ServiceAreaRepository serviceAreaRepository) {
        this.rentalRepository = rentalRepository;
        this.productRepository = productRepository;
        this.serviceAreaRepository = serviceAreaRepository;
    }

    /**
     * Converts cart items into confirmed Rental rows in a single transaction.
     * Mirrors the Node backend's rentalController.createRentals: validates the
     * delivery city is an active service area, locks each product row to avoid
     * a race condition on availableUnits, validates tenure + stock, then
     * creates one Rental per cart item and decrements inventory.
     */
    @Transactional
    public List<RentalResponse> checkout(User user, CheckoutRequest req) {
        ServiceArea area = serviceAreaRepository.findByCityAndIsActiveTrue(req.deliveryCity())
                .orElseThrow(() -> ApiException.badRequest(
                        "Delivery is not yet available in " + req.deliveryCity()));

        List<Rental> created = req.items().stream().map(item -> {
            Product product = productRepository.findByIdForUpdate(item.productId())
                    .orElseThrow(() -> ApiException.notFound("Product " + item.productId() + " not found"));

            if (product.getAvailableUnits() < 1) {
                throw ApiException.badRequest(product.getName() + " is currently out of stock");
            }
            if (!product.getTenureOptions().contains(item.tenureMonths())) {
                throw ApiException.badRequest(item.tenureMonths() + " month tenure is not offered for " + product.getName());
            }

            BigDecimal monthlyRent = product.getMonthlyRentForTenure(item.tenureMonths());
            BigDecimal securityDeposit = product.getSecurityDeposit();
            BigDecimal totalPayable = monthlyRent.add(securityDeposit).setScale(2, RoundingMode.HALF_UP);

            var start = req.deliveryDate();
            var end = start.plusMonths(item.tenureMonths());

            Rental rental = Rental.builder()
                    .user(user)
                    .product(product)
                    .tenureMonths(item.tenureMonths())
                    .monthlyRent(monthlyRent)
                    .securityDeposit(securityDeposit)
                    .totalPayable(totalPayable)
                    .deliveryDate(req.deliveryDate())
                    .deliveryAddress(req.deliveryAddress())
                    .deliveryCity(req.deliveryCity())
                    .startDate(start)
                    .endDate(end)
                    .status(RentalStatus.PENDING)
                    .build();

            product.setAvailableUnits(product.getAvailableUnits() - 1);
            productRepository.save(product);

            return rentalRepository.save(rental);
        }).collect(Collectors.toList());

        return created.stream().map(RentalResponse::from).collect(Collectors.toList());
    }

    public List<RentalResponse> getMyRentals(User user) {
        return rentalRepository.findAllByUserOrderByCreatedAtDesc(user)
                .stream().map(RentalResponse::from).collect(Collectors.toList());
    }

    public List<RentalResponse> getAllRentals(String statusFilter) {
        List<Rental> rentals = (statusFilter == null || statusFilter.isBlank())
                ? rentalRepository.findAllByOrderByCreatedAtDesc()
                : rentalRepository.findAllByStatusOrderByCreatedAtDesc(parseStatus(statusFilter));

        return rentals.stream().map(RentalResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public RentalResponse updateStatus(UUID rentalId, RentalStatusUpdateRequest req) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> ApiException.notFound("Rental not found"));

        boolean wasTerminal = TERMINAL_STATUSES.contains(rental.getStatus());
        RentalStatus newStatus = parseStatus(req.status());
        boolean willBeTerminal = TERMINAL_STATUSES.contains(newStatus);

        rental.setStatus(newStatus);
        if (req.damageNotes() != null) rental.setDamageNotes(req.damageNotes());
        if (newStatus == RentalStatus.RETURN_REQUESTED) rental.setReturnRequested(true);

        // Restock the unit once a rental reaches a terminal state
        if (!wasTerminal && willBeTerminal) {
            Product product = rental.getProduct();
            product.setAvailableUnits(product.getAvailableUnits() + 1);
            productRepository.save(product);
        }

        return RentalResponse.from(rentalRepository.save(rental));
    }

    @Transactional
    public RentalResponse requestReturn(UUID rentalId, User user) {
        Rental rental = rentalRepository.findByIdAndUser(rentalId, user)
                .orElseThrow(() -> ApiException.notFound("Rental not found"));

        rental.setReturnRequested(true);
        rental.setStatus(RentalStatus.RETURN_REQUESTED);
        return RentalResponse.from(rentalRepository.save(rental));
    }

    @Transactional
    public RentalResponse extend(UUID rentalId, User user, ExtendRentalRequest req) {
        Rental rental = rentalRepository.findByIdAndUser(rentalId, user)
                .orElseThrow(() -> ApiException.notFound("Rental not found"));

        if (rental.getStatus() == RentalStatus.COMPLETED || rental.getStatus() == RentalStatus.CANCELLED
                || rental.getStatus() == RentalStatus.RETURN_REQUESTED) {
            throw ApiException.badRequest("Cannot extend a rental that is " + rental.getStatus().name().toLowerCase());
        }

        rental.setTenureMonths(rental.getTenureMonths() + req.additionalMonths());
        rental.setEndDate(rental.getEndDate().plusMonths(req.additionalMonths()));

        return RentalResponse.from(rentalRepository.save(rental));
    }

    private RentalStatus parseStatus(String raw) {
        try {
            return RentalStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid rental status: " + raw);
        }
    }
}
