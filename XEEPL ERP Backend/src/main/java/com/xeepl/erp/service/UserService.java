package com.xeepl.erp.service;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.entity.User;
import com.xeepl.erp.entity.UserRole;
import com.xeepl.erp.mapper.UserMapper;
import com.xeepl.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserMapper.toDTO(u);
    }

    public UserDTO createUser(UserCreateDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        User user = UserMapper.toEntity(dto);
        user = userRepository.save(user);
        return UserMapper.toDTO(user);
    }

    public UserDTO updateUser(Long id, UserUpdateDTO dto) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Apply only non-null fields
        UserMapper.applyUpdate(existing, dto);

        // Ensure role is not null (important fix)
        if (existing.getRole() == null) {
            throw new IllegalArgumentException("Role cannot be null. Please include role or keep old role.");
        }

        User saved = userRepository.save(existing);
        return UserMapper.toDTO(saved);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
