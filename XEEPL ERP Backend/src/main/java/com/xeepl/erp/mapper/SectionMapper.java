package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.ContentDTO;
import com.xeepl.erp.dto.SectionDTO;
import com.xeepl.erp.entity.Content;
import com.xeepl.erp.entity.Section;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class SectionMapper {

    public static SectionDTO toDTO(Section s) {
        if (s == null) return null;

        List<ContentDTO> contents;
        try {
            contents = (s.getContents() == null)
                    ? Collections.emptyList()
                    : s.getContents().stream()
                    .map(SectionMapper::contentToDTO)
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            contents = Collections.emptyList();
        }

        return new SectionDTO(
                s.getId(),
                s.getTitle(),
                contents,
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }

    private static ContentDTO contentToDTO(Content c) {
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
}
