package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class ItemUpdateDTO {
    private String itemName;
    private Long itemCategoryId;
    private Long itemSubcategoryId;
    private Long supplierId;
    private Double itemQty;
    private Double itemPrice;
    private String itemCode;
    private String description;
}
