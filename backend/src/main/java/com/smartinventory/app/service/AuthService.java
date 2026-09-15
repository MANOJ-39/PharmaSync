package com.smartinventory.app.service;

import com.smartinventory.app.dto.AuthRequest;
import com.smartinventory.app.dto.AuthResponse;
import com.smartinventory.app.entity.User;
import com.smartinventory.app.repository.UserRepository;
import com.smartinventory.app.security.CustomUserDetails;
import com.smartinventory.app.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("User not found"));

        if (!user.isActive()) {
            throw new org.springframework.security.authentication.DisabledException("User account is disabled");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}
