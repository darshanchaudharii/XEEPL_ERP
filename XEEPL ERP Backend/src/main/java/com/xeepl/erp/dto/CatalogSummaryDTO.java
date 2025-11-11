package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class CatalogSummaryDTO {
    private Long id;
    private String title;
    private String description;
    private String logoUrl;
}