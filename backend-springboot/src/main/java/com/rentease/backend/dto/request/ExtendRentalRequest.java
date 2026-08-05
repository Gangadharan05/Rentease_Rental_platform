package com.rentease.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ExtendRentalRequest(
        @NotNull(message = "is required") @Min(value = 1, message = "must be at least 1") Integer additionalMonths
) {
}
