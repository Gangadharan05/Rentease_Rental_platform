package com.rentease.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CheckoutRequest(
        @NotEmpty(message = "must contain at least one item") @Valid List<CheckoutItem> items,
        @NotNull(message = "is required") LocalDate deliveryDate,
        @NotNull(message = "is required") String deliveryAddress,
        @NotNull(message = "is required") String deliveryCity
) {
    public record CheckoutItem(
            @NotNull(message = "is required") UUID productId,
            @NotNull(message = "is required") @Min(value = 1, message = "must be at least 1") Integer tenureMonths
    ) {
    }
}
