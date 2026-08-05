package com.rentease.backend.dto.response;

import com.rentease.backend.entity.Product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public record ProductResponse(
        UUID id,
        String name,
        String category,
        String subCategory,
        String description,
        String imageUrl,
        BigDecimal baseMonthlyRent,
        BigDecimal securityDeposit,
        List<Integer> tenureOptions,
        Integer totalUnits,
        Integer availableUnits,
        String status,
        List<TenurePricing> tenurePricing,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record TenurePricing(Integer months, BigDecimal monthlyRent) {
    }

    public static ProductResponse from(Product p) {
        List<TenurePricing> pricing = p.getTenureOptions().stream()
                .map(months -> new TenurePricing(months, p.getMonthlyRentForTenure(months)))
                .collect(Collectors.toList());

        return new ProductResponse(
                p.getId(), p.getName(), p.getCategory().name().toLowerCase(), p.getSubCategory(),
                p.getDescription(), p.getImageUrl(), p.getBaseMonthlyRent(), p.getSecurityDeposit(),
                p.getTenureOptions(), p.getTotalUnits(), p.getAvailableUnits(),
                p.getStatus().name().toLowerCase(), pricing, p.getCreatedAt(), p.getUpdatedAt()
        );
    }

    /** Minimal summary used when nesting a product inside a rental response. */
    public record Summary(UUID id, String name, String imageUrl, String category, String subCategory) {
        public static Summary from(Product p) {
            return new Summary(p.getId(), p.getName(), p.getImageUrl(),
                    p.getCategory().name().toLowerCase(), p.getSubCategory());
        }
    }
}
