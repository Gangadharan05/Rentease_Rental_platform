package com.rentease.backend.service;

import com.rentease.backend.dto.response.ReportResponse;
import com.rentease.backend.dto.response.UserResponse;
import com.rentease.backend.entity.MaintenanceRequest;
import com.rentease.backend.entity.Product;
import com.rentease.backend.entity.Rental;
import com.rentease.backend.entity.enums.MaintenanceStatus;
import com.rentease.backend.entity.enums.RentalStatus;
import com.rentease.backend.entity.enums.Role;
import com.rentease.backend.repository.MaintenanceRequestRepository;
import com.rentease.backend.repository.ProductRepository;
import com.rentease.backend.repository.RentalRepository;
import com.rentease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final List<RentalStatus> ACTIVE_STATUSES =
            List.of(RentalStatus.CONFIRMED, RentalStatus.DELIVERED, RentalStatus.ACTIVE);

    private final RentalRepository rentalRepository;
    private final ProductRepository productRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final UserRepository userRepository;

    public AdminService(RentalRepository rentalRepository, ProductRepository productRepository,
                         MaintenanceRequestRepository maintenanceRepository, UserRepository userRepository) {
        this.rentalRepository = rentalRepository;
        this.productRepository = productRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.userRepository = userRepository;
    }

    public ReportResponse getReports() {
        List<Rental> activeRentals = rentalRepository.findAllByStatusIn(ACTIVE_STATUSES);
        long activeRentalsCount = activeRentals.size();
        BigDecimal mrr = activeRentals.stream()
                .map(Rental::getMonthlyRent)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        List<Product> products = productRepository.findAll();
        long totalUnits = products.stream().mapToLong(Product::getTotalUnits).sum();
        long availableUnits = products.stream().mapToLong(Product::getAvailableUnits).sum();
        long rentedUnits = totalUnits - availableUnits;
        double utilizationRate = totalUnits > 0
                ? round1((rentedUnits * 100.0) / totalUnits)
                : 0.0;

        // Retention: customers who placed more than one rental, as a % of all
        // customers who have placed at least one rental.
        List<Rental> allRentals = rentalRepository.findAllByOrderByCreatedAtDesc();
        Map<UUID, Long> rentalCountByUser = new HashMap<>();
        for (Rental r : allRentals) {
            UUID userId = r.getUser().getId();
            rentalCountByUser.merge(userId, 1L, Long::sum);
        }
        long totalCustomersWithRentals = rentalCountByUser.size();
        long repeatCustomers = rentalCountByUser.values().stream().filter(c -> c > 1).count();
        double retentionRate = totalCustomersWithRentals > 0
                ? round1((repeatCustomers * 100.0) / totalCustomersWithRentals)
                : 0.0;

        List<MaintenanceRequest> resolvedRequests = maintenanceRepository.findAllByStatus(MaintenanceStatus.RESOLVED);
        double avgResolutionHours = 0.0;
        if (!resolvedRequests.isEmpty()) {
            double totalHours = resolvedRequests.stream()
                    .mapToDouble(req -> {
                        LocalDateTime created = req.getCreatedAt();
                        LocalDateTime resolved = req.getResolvedAt() != null ? req.getResolvedAt() : req.getUpdatedAt();
                        return Duration.between(created, resolved).toMinutes() / 60.0;
                    }).sum();
            avgResolutionHours = round1(totalHours / resolvedRequests.size());
        }

        long openMaintenanceCount = maintenanceRepository.countByStatusNot(MaintenanceStatus.RESOLVED);
        long totalUsers = userRepository.countByRole(Role.CUSTOMER);
        long totalProducts = products.size();

        return new ReportResponse(
                activeRentalsCount, mrr, utilizationRate, retentionRate, avgResolutionHours,
                openMaintenanceCount, totalUsers, totalProducts, totalUnits, availableUnits, rentedUnits
        );
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(UserResponse::from).collect(Collectors.toList());
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
