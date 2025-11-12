package com.xeepl.erp.dto;

import com.xeepl.erp.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String fullName;
    private UserRole role;
    private String email;
}

