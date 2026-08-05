package com.rentease.backend.dto.response;

import com.rentease.backend.entity.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String role,
        String address,
        String city,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(), u.getName(), u.getEmail(), u.getPhone(),
                u.getRole().name().toLowerCase(), u.getAddress(), u.getCity(),
                u.getCreatedAt(), u.getUpdatedAt()
        );
    }

    /** Minimal summary used when nesting a user inside a rental/maintenance response. */
    public record Summary(UUID id, String name, String email, String phone) {
        public static Summary from(User u) {
            return new Summary(u.getId(), u.getName(), u.getEmail(), u.getPhone());
        }
    }
}
