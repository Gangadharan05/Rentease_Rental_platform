package com.rentease.backend.repository;

import com.rentease.backend.entity.User;
import com.rentease.backend.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    List<User> findAllByOrderByCreatedAtDesc();
}
