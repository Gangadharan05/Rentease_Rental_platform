package com.rentease.backend.repository;

import com.rentease.backend.entity.MaintenanceRequest;
import com.rentease.backend.entity.User;
import com.rentease.backend.entity.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, java.util.UUID> {

    List<MaintenanceRequest> findAllByUserOrderByCreatedAtDesc(User user);

    List<MaintenanceRequest> findAllByOrderByCreatedAtDesc();

    List<MaintenanceRequest> findAllByStatusOrderByCreatedAtDesc(MaintenanceStatus status);

    long countByStatusNot(MaintenanceStatus status);

    List<MaintenanceRequest> findAllByStatus(MaintenanceStatus status);
}
