package com.rentease.backend.controller;

import com.rentease.backend.dto.request.MaintenanceCreateRequest;
import com.rentease.backend.dto.request.MaintenanceUpdateRequest;
import com.rentease.backend.dto.response.MaintenanceResponse;
import com.rentease.backend.entity.User;
import com.rentease.backend.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceResponse> createRequest(@AuthenticationPrincipal User user,
                                                               @Valid @RequestBody MaintenanceCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceService.createRequest(user, req));
    }

    @GetMapping("/my")
    public ResponseEntity<List<MaintenanceResponse>> getMyRequests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(maintenanceService.getMyRequests(user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MaintenanceResponse>> getAllRequests(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(maintenanceService.getAllRequests(status));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaintenanceResponse> updateRequest(@PathVariable UUID id,
                                                               @RequestBody MaintenanceUpdateRequest req) {
        return ResponseEntity.ok(maintenanceService.updateRequest(id, req));
    }
}
