package com.xeepl.erp.controller;

import com.xeepl.erp.dto.UserCreateDTO;
import com.xeepl.erp.dto.UserDTO;
import com.xeepl.erp.dto.UserUpdateDTO;
import com.xeepl.erp.entity.UserRole;
import com.xeepl.erp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestParam Optional<UserRole> role) {
        return ResponseEntity.ok(userService.getAllUsers(role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<UserDTO> createUser(
            @ModelAttribute UserCreateDTO userDto,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto
    ) throws IOException {
        UserDTO created = userService.createUser(userDto, profilePhoto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @ModelAttribute UserUpdateDTO userDto,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto
    ) throws IOException {
        UserDTO updated = userService.updateUser(id, userDto, profilePhoto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
