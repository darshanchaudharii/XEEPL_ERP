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

    // required title, length 500
    @Column(nullable = false, length = 500)
    private String title;

    // sequence default 0
    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer sequence = 0;

    // textual description (TEXT)
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "alt_tag")
    private String altTag;

    @Column(length = 500)
    private String link;

    @Column(name = "image_path", length = 500)
    private String imagePath;

    @Column(name = "image_type", length = 50)
    private String imageType;

    @Column(name = "image_size")
    private Long imageSize;

    // many-to-one: content belongs to a section
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
