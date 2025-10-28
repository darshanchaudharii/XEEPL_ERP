package com.xeepl.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectionDTO {
    private Long id;
    private String title;
    private List<ContentDTO> contents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
