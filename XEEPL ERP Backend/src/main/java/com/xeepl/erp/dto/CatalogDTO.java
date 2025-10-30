package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class CatalogDTO {
    private Long id;
    private String title;
    private String description;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String createdOn;
    private String updatedOn;
    private String downloadUrl;
}
