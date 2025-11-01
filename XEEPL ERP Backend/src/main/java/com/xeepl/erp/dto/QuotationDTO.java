package com.xeepl.erp.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class QuotationDTO {
    private Long id;
    private String name;
    private LocalDate date;
    private LocalDate expiryDate;
    private String status;
    private CustomerSummaryDTO customer;
    private List<CatalogSummaryDTO> linkedCatalogs;
    private List<QuotationLineDTO> items;
}
