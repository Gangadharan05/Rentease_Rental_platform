package com.rentease.backend.dto.response;

import com.rentease.backend.entity.MaintenanceRequest;

import java.time.LocalDateTime;
import java.util.UUID;

public record MaintenanceResponse(
        UUID id,
        RentalResponse.Summary rental,
        UserResponse.Summary user,
        String issueDescription,
        String status,
        String resolutionNotes,
        LocalDateTime resolvedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static MaintenanceResponse from(MaintenanceRequest m) {
        return new MaintenanceResponse(
                m.getId(),
                RentalResponse.Summary.from(m.getRental()),
                UserResponse.Summary.from(m.getUser()),
                m.getIssueDescription(), m.getStatus().name().toLowerCase(),
                m.getResolutionNotes(), m.getResolvedAt(), m.getCreatedAt(), m.getUpdatedAt()
        );
    }
}
