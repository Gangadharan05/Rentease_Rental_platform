package com.rentease.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MaintenanceCreateRequest(
        @NotNull(message = "is required") UUID rentalId,
        @NotBlank(message = "is required") String issueDescription
) {
}
