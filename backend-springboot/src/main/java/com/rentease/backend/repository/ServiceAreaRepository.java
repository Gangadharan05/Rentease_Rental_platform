package com.rentease.backend.repository;

import com.rentease.backend.entity.ServiceArea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceAreaRepository extends JpaRepository<ServiceArea, UUID> {
    List<ServiceArea> findAllByIsActiveTrueOrderByCityAsc();
    List<ServiceArea> findAllByOrderByCityAsc();
    Optional<ServiceArea> findByCityAndIsActiveTrue(String city);
    boolean existsByCity(String city);
}
