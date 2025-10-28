package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.UserDTO;
import com.xeepl.erp.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserDTO toDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setUsername(user.getUsername());
        dto.setMobile(user.getMobile());
        dto.setRole(user.getRole());
        dto.setProfilePhoto(user.getProfilePhoto());
        return dto;
    }
}
