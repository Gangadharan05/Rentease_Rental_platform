package com.rentease.backend.security;

import com.rentease.backend.entity.User;
import com.rentease.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtUtil.isTokenValid(token)) {
                try {
                    UUID userId = jwtUtil.extractUserId(token);
                    Optional<User> userOpt = userRepository.findById(userId);

                    if (userOpt.isPresent() && SecurityContextHolder.getContext().getAuthentication() == null) {
                        User user = userOpt.get();
                        List<GrantedAuthority> authorities =
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

                        var authToken = new UsernamePasswordAuthenticationToken(user, null, authorities);
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } catch (Exception ignored) {
                    // Invalid/expired token -> request proceeds unauthenticated;
                    // protected endpoints will reject it via the security filter chain.
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
