package com.xeepl.erp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SectionCreateDTO {
    @NotBlank
    private String title;
}
