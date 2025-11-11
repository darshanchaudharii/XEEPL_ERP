package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class CustomerSummaryDTO {
    private Long id;
    private String fullName;
    private String email;
    private String mobile;
}