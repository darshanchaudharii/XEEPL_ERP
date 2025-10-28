package com.xeepl.erp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateDTO {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Size(min = 6)
    private String password;

    @NotBlank
    @Size(min = 3, max = 50)
    private String fullName;

    @Pattern(regexp = "^\\d{10}$", message = "Mobile must be 10 digits")
    private String mobile;

    @NotBlank
    private String role;

    private String profilePhoto;


}
