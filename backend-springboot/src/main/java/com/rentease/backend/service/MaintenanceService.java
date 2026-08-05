package com.rentease.backend.service;

import com.rentease.backend.dto.request.MaintenanceCreateRequest;
import com.rentease.backend.dto.request.MaintenanceUpdateRequest;
import com.rentease.backend.dto.response.MaintenanceResponse;
import com.rentease.backend.entity.MaintenanceRequest;
import com.rentease.backend.entity.Rental;
import com.rentease.backend.entity.User;
import com.rentease.backend.entity.enums.MaintenanceStatus;
import com.rentease.backend.exception.ApiException;
import com.rentease.backend.repository.MaintenanceRequestRepository;
import com.rentease.backend.repository.RentalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRepository;
    private final RentalRepository rentalRepository;

    public MaintenanceService(MaintenanceRequestRepository maintenanceRepository, RentalRepository rentalRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.rentalRepository = rentalRepository;
    }

    public MaintenanceResponse createRequest(User user, MaintenanceCreateRequest req) {
        Rental rental = rentalRepository.findByIdAndUser(req.rentalId(), user)
                .orElseThrow(() -> ApiException.notFound("Rental not found for this account"));

        MaintenanceRequest request = MaintenanceRequest.builder()
                .rental(rental)
                .user(user)
                .issueDescription(req.issueDescription())
                .status(MaintenanceStatus.OPEN)
                .build();

        return MaintenanceResponse.from(maintenanceRepository.save(request));
    }

    public List<MaintenanceResponse> getMyRequests(User user) {
        return maintenanceRepository.findAllByUserOrderByCreatedAtDesc(user)
                .stream().map(MaintenanceResponse::from).collect(Collectors.toList());
    }

    public List<MaintenanceResponse> getAllRequests(String statusFilter) {
        List<MaintenanceRequest> requests = (statusFilter == null || statusFilter.isBlank())
                ? maintenanceRepository.findAllByOrderByCreatedAtDesc()
                : maintenanceRepository.findAllByStatusOrderByCreatedAtDesc(parseStatus(statusFilter));

        return requests.stream().map(MaintenanceResponse::from).collect(Collectors.toList());
    }

    public MaintenanceResponse updateRequest(UUID id, MaintenanceUpdateRequest req) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Maintenance request not found"));

        if (req.status() != null) {
            MaintenanceStatus status = parseStatus(req.status());
            request.setStatus(status);
            if (status == MaintenanceStatus.RESOLVED) {
                request.setResolvedAt(LocalDateTime.now());
            }
        }
        if (req.resolutionNotes() != null) {
            request.setResolutionNotes(req.resolutionNotes());
        }

        return MaintenanceResponse.from(maintenanceRepository.save(request));
    }

    private MaintenanceStatus parseStatus(String raw) {
        try {
            return MaintenanceStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid maintenance status: " + raw);
        }
    }
}
