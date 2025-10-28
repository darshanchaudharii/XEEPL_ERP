package com.xeepl.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "contents")
@Data
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer sequence = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "alt_tag")
    private String altTag;

    @Column(length = 500)
    private String link;

    // Image fields
    @Column(name = "image_path", length = 500)
    private String imagePath; // e.g., content-images/uuid.jpg

    @Column(name = "image_type", length = 50)
    private String imageType;

    @Column(name = "image_size")
    private Long imageSize;

    @Column(name = "image_filename", length = 255)
    private String imageFilename; // original file name

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
