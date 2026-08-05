package com.rentease.backend.dto.request;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        String name,
        String category,       // "furniture" | "appliance"
        String subCategory,
        String description,
        String imageUrl,
        BigDecimal baseMonthlyRent,
        BigDecimal securityDeposit,
        List<Integer> tenureOptions,
        Integer totalUnits,
        Integer availableUnits,
        String status           // "active" | "inactive"
) {
}
