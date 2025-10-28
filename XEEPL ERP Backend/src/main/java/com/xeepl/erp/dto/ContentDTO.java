package com.xeepl.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentDTO {
    private Long id;
    private String title;
    private Integer sequence;
    private String description;
    private String altTag;
    private String link;
    private String imagePath;
    private String imageType;
    private Long imageSize;
    private Long sectionId;
    private String sectionTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
