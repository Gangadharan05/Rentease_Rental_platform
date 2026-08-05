package com.rentease.backend.dto.request;

public record ServiceAreaRequest(
        String city,
        Boolean isActive
) {
}
