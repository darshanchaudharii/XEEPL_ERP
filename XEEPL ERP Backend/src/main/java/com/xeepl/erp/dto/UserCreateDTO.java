package com.xeepl.erp.dto;

import com.xeepl.erp.entity.UserRole;
import lombok.Data;

@Data
public class UserCreateDTO {
    private String fullName;
    private String username;
    private String password;
    private String mobile;
    private UserRole role;
}
