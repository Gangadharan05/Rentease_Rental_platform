package com.rentease.backend.service;

import com.rentease.backend.dto.request.LoginRequest;
import com.rentease.backend.dto.request.RegisterRequest;
import com.rentease.backend.dto.response.AuthResponse;
import com.rentease.backend.entity.User;
import com.rentease.backend.entity.enums.Role;
import com.rentease.backend.exception.ApiException;
import com.rentease.backend.repository.UserRepository;
import com.rentease.backend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ApiException("An account with this email already exists", HttpStatus.BAD_REQUEST);
        }

        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .phone(req.phone())
                .address(req.address())
                .city(req.city())
                .role(Role.CUSTOMER)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole().name().toLowerCase(), token);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole().name().toLowerCase(), token);
    }
}
