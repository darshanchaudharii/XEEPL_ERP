package com.xeepl.erp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig - Configures CORS and web settings for Spring Boot backend
 * Purpose: Allow React frontend (http://localhost:5173) to make API calls
 * Enables cross-origin requests for all API endpoints under /api/**
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configure CORS (Cross-Origin Resource Sharing)
     * Allows frontend to communicate with backend across different ports
     *
     * @return WebMvcConfigurer with CORS mappings
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/");
    }
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        // Allow requests from React frontend
                        .allowedOrigins(
                                "http://localhost:5173",     // Vite dev server
                                "http://localhost:3000",     // Create React App fallback
                                "http://127.0.0.1:5173"      // Loopback
                        )
                        // Allow all HTTP methods
                        .allowedMethods(
                                "GET",
                                "POST",
                                "PUT",
                                "DELETE",
                                "PATCH",
                                "OPTIONS"
                        )
                        // Allow specific headers
                        .allowedHeaders(
                                "Content-Type",
                                "Authorization",
                                "X-Requested-With",
                                "Accept",
                                "Origin"
                        )
                        // Allow credentials (cookies, auth headers)
                        .allowCredentials(true)
                        // Cache preflight requests for 1 hour
                        .maxAge(3600);
            }
        };
    }
}
