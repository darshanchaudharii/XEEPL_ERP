package com.xeepl.erp.dto;
import lombok.Data;

@Data
public class UserUpdateDTO {
    private String fullName;
    private String username;
    private String password;
    private String mobile;
    private String role; // optional
    private String profilePhoto;
}
