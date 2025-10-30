package com.xeepl.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "catalogs")
@Data
public class Catalog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 400)
    private String description;

    @Column(name = "file_path", nullable = false, length = 512)
    private String filePath;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "created_on", updatable = false)
    private LocalDateTime createdOn;

    @Column(name = "updated_on")
    private LocalDateTime updatedOn;

    @PrePersist
    protected void onCreate() {
        createdOn = LocalDateTime.now();
        updatedOn = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedOn = LocalDateTime.now();
    }
}
