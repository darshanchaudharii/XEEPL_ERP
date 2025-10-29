package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class RawMaterialDTO {
    private Long id;
    private String name;
    private Double quantity;
    private Double price;
    private String code;
    private Long linkedItemId;
    private String linkedItemName;
    private Long supplierId;
    private String supplierName;
    private Boolean addInQuotation;
    private String description;
    private String createdAt;
    private String updatedAt;
}
