package com.xeepl.erp.dto;
import com.xeepl.erp.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String fullName;
    private String username;
    private String mobile;
    private UserRole role;
    private String profilePhoto;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
