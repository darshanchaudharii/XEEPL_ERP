package com.xeepl.erp.dto;

import lombok.Data;

@Data
public class ContentCreateDTO {
    private Long sectionId;
    private String title;
    private Integer sequence;
    private String description;
    private String altTag;
    private String link;
}
