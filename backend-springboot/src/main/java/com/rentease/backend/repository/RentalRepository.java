package com.rentease.backend.repository;

import com.rentease.backend.entity.Rental;
import com.rentease.backend.entity.User;
import com.rentease.backend.entity.enums.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RentalRepository extends JpaRepository<Rental, UUID> {

    List<Rental> findAllByUserOrderByCreatedAtDesc(User user);

    List<Rental> findAllByOrderByCreatedAtDesc();

    List<Rental> findAllByStatusOrderByCreatedAtDesc(RentalStatus status);

    Optional<Rental> findByIdAndUser(UUID id, User user);

    List<Rental> findAllByStatusIn(List<RentalStatus> statuses);
}
