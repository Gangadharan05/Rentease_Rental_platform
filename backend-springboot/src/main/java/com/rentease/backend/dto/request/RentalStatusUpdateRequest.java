package com.rentease.backend.dto.request;

public record RentalStatusUpdateRequest(
        String status,
        String damageNotes
) {
}
