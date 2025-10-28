package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class ItemDTO {
    private Long id;
    private String itemName;
    private Long itemCategoryId;
    private String itemCategoryName;
    private Long itemSubcategoryId;
    private String itemSubcategoryName;
    private Long supplierId;
    private String supplierName;
    private Double itemQty;
    private Double itemPrice;
    private String itemCode;
    private String description;
    private String createdAt;
    private String updatedAt;
}
