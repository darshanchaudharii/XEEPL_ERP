package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class ContentUpdateDTO {
    private String title;
    private Integer sequence;
    private String description;
    private String altTag;
    private String link;
    private String imagePath;
    private String imageType;
    private Long imageSize;
    private Long sectionId; // to move content
}
