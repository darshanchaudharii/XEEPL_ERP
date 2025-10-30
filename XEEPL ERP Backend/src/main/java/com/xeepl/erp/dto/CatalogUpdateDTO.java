package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class CatalogUpdateDTO {
    private String title;
    private String description;
    // File is handled as MultipartFile in controller, not in this DTO
}
