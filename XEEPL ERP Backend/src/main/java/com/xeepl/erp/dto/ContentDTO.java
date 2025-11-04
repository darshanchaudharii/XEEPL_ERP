package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class ContentDTO {
    private Long id;
    private Long sectionId;
    private String sectionName;
    private String title;
    private Integer sequence;
    private String description;
    private String altTag;
    private String link;
    private String imagePath;
    private String imageType;
    private Long imageSize;
    private String imageFilename;
    private String createdOn;
    private String updatedOn;
}
