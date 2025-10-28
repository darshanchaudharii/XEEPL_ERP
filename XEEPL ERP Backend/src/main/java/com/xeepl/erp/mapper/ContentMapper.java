package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.ContentCreateDTO;
import com.xeepl.erp.dto.ContentDTO;
import com.xeepl.erp.dto.ContentUpdateDTO;
import com.xeepl.erp.entity.Content;
import com.xeepl.erp.entity.Section;

public class ContentMapper {

    public static ContentDTO toDTO(Content c) {
        if (c == null) return null;
        Long sectionId = null;
        String sectionTitle = null;
        try {
            if (c.getSection() != null) {
                sectionId = c.getSection().getId();
                sectionTitle = c.getSection().getTitle();
            }
        } catch (Exception ignored) { }

        return new ContentDTO(
                c.getId(),
                c.getTitle(),
                c.getSequence(),
                c.getDescription(),
                c.getAltTag(),
                c.getLink(),
                c.getImagePath(),
                c.getImageType(),
                c.getImageSize(),
                sectionId,
                sectionTitle,
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }

    public static Content toEntityFromCreateDto(ContentCreateDTO dto, Section section) {
        Content c = new Content();
        c.setTitle(dto.getTitle());
        c.setSequence(dto.getSequence() != null ? dto.getSequence() : 0);
        c.setDescription(dto.getDescription());
        c.setAltTag(dto.getAltTag());
        c.setLink(dto.getLink());
        c.setImagePath(dto.getImagePath());
        c.setImageType(dto.getImageType());
        c.setImageSize(dto.getImageSize());
        c.setSection(section);
        return c;
    }

    public static void applyUpdate(Content c, ContentUpdateDTO dto, Section newSection) {
        if (dto.getTitle() != null) c.setTitle(dto.getTitle());
        if (dto.getSequence() != null) c.setSequence(dto.getSequence());
        if (dto.getDescription() != null) c.setDescription(dto.getDescription());
        if (dto.getAltTag() != null) c.setAltTag(dto.getAltTag());
        if (dto.getLink() != null) c.setLink(dto.getLink());
        if (dto.getImagePath() != null) c.setImagePath(dto.getImagePath());
        if (dto.getImageType() != null) c.setImageType(dto.getImageType());
        if (dto.getImageSize() != null) c.setImageSize(dto.getImageSize());
        if (newSection != null) c.setSection(newSection);
    }
}
