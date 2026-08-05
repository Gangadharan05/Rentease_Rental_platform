package com.rentease.backend.dto.request;

public record MaintenanceUpdateRequest(
        String status,
        String resolutionNotes
) {
}
