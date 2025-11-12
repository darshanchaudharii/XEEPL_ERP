package com.xeepl.erp.dto;

import com.xeepl.erp.entity.UserRole;
import lombok.Data;

@Data
public class UserUpdateDTO {
    private String fullName;
    private String password;
    private String mobile;
    private String email;
    private UserRole role;
}
