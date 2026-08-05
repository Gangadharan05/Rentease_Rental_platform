package com.rentease.backend.dto.response;

import com.rentease.backend.entity.Rental;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record RentalResponse(
        UUID id,
        UserResponse.Summary user,
        ProductResponse.Summary product,
        Integer tenureMonths,
        BigDecimal monthlyRent,
        BigDecimal securityDeposit,
        BigDecimal totalPayable,
        LocalDate deliveryDate,
        String deliveryAddress,
        String deliveryCity,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        Boolean returnRequested,
        String damageNotes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static RentalResponse from(Rental r) {
        return new RentalResponse(
                r.getId(),
                UserResponse.Summary.from(r.getUser()),
                ProductResponse.Summary.from(r.getProduct()),
                r.getTenureMonths(), r.getMonthlyRent(), r.getSecurityDeposit(), r.getTotalPayable(),
                r.getDeliveryDate(), r.getDeliveryAddress(), r.getDeliveryCity(),
                r.getStartDate(), r.getEndDate(), r.getStatus().name().toLowerCase(),
                r.getReturnRequested(), r.getDamageNotes(), r.getCreatedAt(), r.getUpdatedAt()
        );
    }

    /** Lightweight rental + product summary, used when nesting under a maintenance response. */
    public record Summary(UUID id, ProductResponse.Summary product, String status, LocalDate endDate) {
        public static Summary from(Rental r) {
            return new Summary(r.getId(), ProductResponse.Summary.from(r.getProduct()),
                    r.getStatus().name().toLowerCase(), r.getEndDate());
        }
    }
}
