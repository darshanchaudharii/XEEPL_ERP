package com.xeepl.erp.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QuotationLineUpdateDTO {
    private Long id; // optional, used to preserve removed flag on update/replace

    private String itemDescription;

    @Min(0)
    private Integer quantity;

    private BigDecimal unitPrice;

    private Boolean isRawMaterial;
    private Long parentItemId;
    private Long rawId;
    private Boolean removed; // flag to indicate if line is soft deleted
}
