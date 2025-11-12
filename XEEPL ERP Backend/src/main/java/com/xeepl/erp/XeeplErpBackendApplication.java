package com.xeepl.erp;

import com.xeepl.erp.entity.User;
import com.xeepl.erp.entity.UserRole;
import com.xeepl.erp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class XeeplErpBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(XeeplErpBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminUsername = "Darshan4998";
            String adminPassword = "Darshan@4998";
            
            userRepository.findByUsername(adminUsername).ifPresentOrElse(
                existingUser -> {
                    // User exists - update password to ensure it's correctly encrypted
                    existingUser.setPassword(passwordEncoder.encode(adminPassword));
                    existingUser.setFullName("Darshan Chaudhari");
                    existingUser.setMobile("7666358663");
                    existingUser.setEmail("darshanchaudhari4998@gmail.com");
                    existingUser.setRole(UserRole.Admin);
                    userRepository.save(existingUser);
                },
                () -> {
                    // User doesn't exist - create new admin user
                    User admin = new User();
                    admin.setFullName("Darshan Chaudhari");
                    admin.setUsername(adminUsername);
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setMobile("7666358663");
                    admin.setEmail("darshanchaudhari4998@gmail.com");
                    admin.setRole(UserRole.Admin);
                    userRepository.save(admin);
                }
            );
        };
    }
}
