package com.xeepl.erp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
@Data
public class QuotationUpdateDTO {
    @NotBlank
    private String name;
    @NotNull
    private LocalDate date;
    @NotNull private LocalDate expiryDate;
    private String status;
    private Long customerId;
    private List<Long> catalogIds;
    @NotEmpty
    private List<QuotationLineUpdateDTO> items;
}

