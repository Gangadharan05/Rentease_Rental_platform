package com.rentease.backend.dto.response;

import com.rentease.backend.entity.ServiceArea;

import java.util.UUID;

public record ServiceAreaResponse(
        UUID id,
        String city,
        Boolean isActive
) {
    public static ServiceAreaResponse from(ServiceArea s) {
        return new ServiceAreaResponse(s.getId(), s.getCity(), s.getIsActive());
    }
}
