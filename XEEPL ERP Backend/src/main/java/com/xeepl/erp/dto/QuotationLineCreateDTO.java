package com.xeepl.erp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class QuotationLineCreateDTO {
    @NotBlank
    private String itemDescription;
    @Min(1) private int quantity;
    @DecimalMin("0.01") private BigDecimal unitPrice;
}

