package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.ContentDTO;
import com.xeepl.erp.entity.Content;
import org.springframework.stereotype.Component;

@Component
public class ContentMapper {
    public ContentDTO toDto(Content content) {
        ContentDTO dto = new ContentDTO();
        dto.setId(content.getId());
        if(content.getSection() != null) {
            dto.setSectionId(content.getSection().getId());
            dto.setSectionName(content.getSection().getSectionName());
        }
        dto.setTitle(content.getTitle());
        dto.setSequence(content.getSequence());
        dto.setDescription(content.getDescription());
        dto.setAltTag(content.getAltTag());
        dto.setLink(content.getLink());
        dto.setImagePath(content.getImagePath());
        dto.setImageType(content.getImageType());
        dto.setImageSize(content.getImageSize());
        dto.setImageFilename(content.getImageFilename());
        return dto;
    }
}
