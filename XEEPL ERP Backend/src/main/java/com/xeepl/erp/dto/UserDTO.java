package com.xeepl.erp.dto;

import com.xeepl.erp.entity.UserRole;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String fullName;
    private String username;
    private String mobile;
    private String email;
    private UserRole role;
    private String profilePhoto;
}
