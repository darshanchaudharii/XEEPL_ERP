package com.xeepl.erp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class QuotationLineDTO {
    private Long id;
    private String itemDescription;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;
    private Boolean isRawMaterial;
    private Long parentItemId;
    private Long rawId;
    private Boolean removed;
    private Integer sequence;
}
