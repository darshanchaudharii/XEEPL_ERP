package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.entity.User;
import com.xeepl.erp.entity.UserRole;

public class UserMapper {
    public static User toEntity(UserCreateDTO dto) {
        User u = new User();
        u.setFullName(dto.getFullName());
        u.setUsername(dto.getUsername());
        u.setPassword(dto.getPassword());
        u.setMobile(dto.getMobile());
        u.setRole(UserRole.valueOf(dto.getRole()));
        u.setProfilePhoto(dto.getProfilePhoto());
        return u;
    }

    public static UserDTO toDTO(User u) {
        return new UserDTO(
                u.getId(),
                u.getFullName(),
                u.getUsername(),
                u.getMobile(),
                u.getRole(),
                u.getProfilePhoto(),
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }

    public static void applyUpdate(User user, UserUpdateDTO dto) {
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getUsername() != null) user.setUsername(dto.getUsername());
        if (dto.getPassword() != null) user.setPassword(dto.getPassword());
        if (dto.getMobile() != null) user.setMobile(dto.getMobile());
        if (dto.getProfilePhoto() != null) user.setProfilePhoto(dto.getProfilePhoto());
        if (dto.getRole() != null) {
            user.setRole(UserRole.valueOf(dto.getRole()));
        }
    }

}
