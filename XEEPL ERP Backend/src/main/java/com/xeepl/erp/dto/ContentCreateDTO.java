package com.xeepl.erp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ContentCreateDTO {
    @NotBlank
    private String title;

    private Integer sequence; // optional, default handled in entity

    private String description;
    private String altTag;
    private String link;
    private String imagePath;
    private String imageType;
    private Long imageSize;

    @NotNull(message = "sectionId is required")
    private Long sectionId;
}
