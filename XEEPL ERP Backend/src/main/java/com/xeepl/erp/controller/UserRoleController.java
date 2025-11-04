package com.xeepl.erp.controller;

import com.xeepl.erp.entity.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-roles")
public class UserRoleController {@GetMapping
public ResponseEntity<UserRole[]> getUserRoles() {
    // Returns all enum values as an array
    return ResponseEntity.ok(UserRole.values());
}
}