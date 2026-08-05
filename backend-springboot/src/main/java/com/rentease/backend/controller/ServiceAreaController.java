package com.rentease.backend.controller;

import com.rentease.backend.dto.request.ServiceAreaRequest;
import com.rentease.backend.dto.response.ServiceAreaResponse;
import com.rentease.backend.service.ServiceAreaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/service-areas")
public class ServiceAreaController {

    private final ServiceAreaService serviceAreaService;

    public ServiceAreaController(ServiceAreaService serviceAreaService) {
        this.serviceAreaService = serviceAreaService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceAreaResponse>> getActiveAreas() {
        return ResponseEntity.ok(serviceAreaService.getActiveAreas());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceAreaResponse>> getAllAreas() {
        return ResponseEntity.ok(serviceAreaService.getAllAreas());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceAreaResponse> createArea(@RequestBody ServiceAreaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceAreaService.createArea(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceAreaResponse> updateArea(@PathVariable UUID id, @RequestBody ServiceAreaRequest req) {
        return ResponseEntity.ok(serviceAreaService.updateArea(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteArea(@PathVariable UUID id) {
        serviceAreaService.deleteArea(id);
        return ResponseEntity.ok(Map.of("message", "Service area removed"));
    }
}
