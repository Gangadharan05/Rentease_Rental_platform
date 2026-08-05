package com.rentease.backend.controller;

import com.rentease.backend.dto.request.CheckoutRequest;
import com.rentease.backend.dto.request.ExtendRentalRequest;
import com.rentease.backend.dto.request.RentalStatusUpdateRequest;
import com.rentease.backend.dto.response.RentalResponse;
import com.rentease.backend.entity.User;
import com.rentease.backend.service.RentalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    public ResponseEntity<List<RentalResponse>> checkout(@AuthenticationPrincipal User user,
                                                           @Valid @RequestBody CheckoutRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.checkout(user, req));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RentalResponse>> getMyRentals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rentalService.getMyRentals(user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RentalResponse>> getAllRentals(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(rentalService.getAllRentals(status));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RentalResponse> updateStatus(@PathVariable UUID id,
                                                         @RequestBody RentalStatusUpdateRequest req) {
        return ResponseEntity.ok(rentalService.updateStatus(id, req));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<RentalResponse> requestReturn(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rentalService.requestReturn(id, user));
    }

    @PostMapping("/{id}/extend")
    public ResponseEntity<RentalResponse> extend(@PathVariable UUID id, @AuthenticationPrincipal User user,
                                                   @Valid @RequestBody ExtendRentalRequest req) {
        return ResponseEntity.ok(rentalService.extend(id, user, req));
    }
}
