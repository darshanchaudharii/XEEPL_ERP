package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class RawMaterialCreateDTO {
    private String name;
    private Double quantity;
    private Double price;
    private String code;
    private Long linkedItemId;
    private Long supplierId;
    private Boolean addInQuotation; //true:yes, false:no
    private String description;
}
