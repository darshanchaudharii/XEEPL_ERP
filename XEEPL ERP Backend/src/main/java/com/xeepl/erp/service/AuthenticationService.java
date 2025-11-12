package com.xeepl.erp.service;

import com.xeepl.erp.dto.LoginRequest;
import com.xeepl.erp.dto.LoginResponse;
import com.xeepl.erp.entity.User;
import com.xeepl.erp.exception.ResourceNotFoundException;
import com.xeepl.erp.repository.UserRepository;
import com.xeepl.erp.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        // Trim username to handle any whitespace issues
        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        // Verify password
        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                user.getEmail()
        );
    }
}

