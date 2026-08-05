package com.rentease.backend.dto.response;

import java.math.BigDecimal;

public record ReportResponse(
        long activeRentalsCount,
        BigDecimal monthlyRecurringRevenue,
        double productUtilizationRate,
        double customerRetentionRate,
        double avgMaintenanceResolutionHours,
        long openMaintenanceCount,
        long totalUsers,
        long totalProducts,
        long totalUnits,
        long availableUnits,
        long rentedUnits
) {
}
