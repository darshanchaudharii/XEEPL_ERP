package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.SectionDTO;
import com.xeepl.erp.entity.Section;
import org.springframework.stereotype.Component;

@Component
public class SectionMapper {
    public SectionDTO toDto(Section section) {
        SectionDTO dto = new SectionDTO();
        dto.setId(section.getId());
        dto.setSectionName(section.getSectionName());
        return dto;
    }
}
