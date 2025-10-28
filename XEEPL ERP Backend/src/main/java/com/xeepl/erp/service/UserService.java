package com.xeepl.erp.service;

import com.xeepl.erp.dto.UserCreateDTO;
import com.xeepl.erp.dto.UserDTO;
import com.xeepl.erp.dto.UserUpdateDTO;
import com.xeepl.erp.entity.User;
import com.xeepl.erp.entity.UserRole;
import com.xeepl.erp.exception.ResourceNotFoundException;
import com.xeepl.erp.mapper.UserMapper;
import com.xeepl.erp.repository.UserRepository;
import com.xeepl.erp.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final FileUploadUtil fileUploadUtil;
    // You can modify this constant as requirements change
    private static final long MAX_PROFILE_PHOTO_SIZE = 512 * 1024; // 512 KB

    public List<UserDTO> getAllUsers(Optional<UserRole> role) {
        List<User> users = role.map(userRepository::findByRole).orElseGet(userRepository::findAll);
        return users.stream().map(userMapper::toDto).collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toDto(user);
    }

    public UserDTO createUser(UserCreateDTO dto, MultipartFile profilePhoto) throws IOException {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword()); // In prod: encrypt!
        user.setMobile(dto.getMobile());
        user.setRole(dto.getRole());
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            fileUploadUtil.validateImageFile(profilePhoto, MAX_PROFILE_PHOTO_SIZE);
            String photoPath = fileUploadUtil.saveFile(profilePhoto, "profiles");
            user.setProfilePhoto(photoPath);
        }
        return userMapper.toDto(userRepository.save(user));
    }

    public UserDTO updateUser(Long id, UserUpdateDTO dto, MultipartFile profilePhoto) throws IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setFullName(dto.getFullName());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(dto.getPassword());
        }
        user.setMobile(dto.getMobile());
        user.setRole(dto.getRole());
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            fileUploadUtil.validateImageFile(profilePhoto, MAX_PROFILE_PHOTO_SIZE);
            if (user.getProfilePhoto() != null) {
                fileUploadUtil.deleteFile(user.getProfilePhoto());
            }
            String photoPath = fileUploadUtil.saveFile(profilePhoto, "profiles");
            user.setProfilePhoto(photoPath);
        }
        return userMapper.toDto(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (user.getProfilePhoto() != null) {
            fileUploadUtil.deleteFile(user.getProfilePhoto());
        }
        userRepository.delete(user);
    }
}
