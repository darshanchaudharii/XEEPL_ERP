package com.xeepl.erp.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QuotationLineCreateDTO {
    @NotBlank
    private String itemDescription;

    @NotNull
    @Min(0)
    private Integer quantity;

    private BigDecimal unitPrice;

    // raw/material linkage
    private Boolean isRawMaterial;
    private Long parentItemId;
    private Long rawId;
    private Integer sequence;
}
