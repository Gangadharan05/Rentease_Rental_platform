package com.rentease.backend.service;

import com.rentease.backend.dto.request.ServiceAreaRequest;
import com.rentease.backend.dto.response.ServiceAreaResponse;
import com.rentease.backend.entity.ServiceArea;
import com.rentease.backend.exception.ApiException;
import com.rentease.backend.repository.ServiceAreaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ServiceAreaService {

    private final ServiceAreaRepository serviceAreaRepository;

    public ServiceAreaService(ServiceAreaRepository serviceAreaRepository) {
        this.serviceAreaRepository = serviceAreaRepository;
    }

    public List<ServiceAreaResponse> getActiveAreas() {
        return serviceAreaRepository.findAllByIsActiveTrueOrderByCityAsc()
                .stream().map(ServiceAreaResponse::from).collect(Collectors.toList());
    }

    public List<ServiceAreaResponse> getAllAreas() {
        return serviceAreaRepository.findAllByOrderByCityAsc()
                .stream().map(ServiceAreaResponse::from).collect(Collectors.toList());
    }

    public ServiceAreaResponse createArea(ServiceAreaRequest req) {
        if (req.city() == null || req.city().isBlank()) {
            throw ApiException.badRequest("City is required");
        }
        ServiceArea area = ServiceArea.builder().city(req.city()).isActive(true).build();
        return ServiceAreaResponse.from(serviceAreaRepository.save(area));
    }

    public ServiceAreaResponse updateArea(UUID id, ServiceAreaRequest req) {
        ServiceArea area = serviceAreaRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Service area not found"));

        if (req.city() != null) area.setCity(req.city());
        if (req.isActive() != null) area.setIsActive(req.isActive());

        return ServiceAreaResponse.from(serviceAreaRepository.save(area));
    }

    public void deleteArea(UUID id) {
        if (!serviceAreaRepository.existsById(id)) {
            throw ApiException.notFound("Service area not found");
        }
        serviceAreaRepository.deleteById(id);
    }
}
