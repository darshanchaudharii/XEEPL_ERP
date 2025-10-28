package com.xeepl.erp.service;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.entity.Content;
import com.xeepl.erp.entity.Section;
import com.xeepl.erp.mapper.ContentMapper;
import com.xeepl.erp.repository.ContentRepository;
import com.xeepl.erp.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {

    private final ContentRepository contentRepository;
    private final SectionRepository sectionRepository;

    public ContentDTO createContent(ContentCreateDTO dto) {
        Section section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new RuntimeException("Section not found"));

        Content c = ContentMapper.toEntityFromCreateDto(dto, section);
        Content saved = contentRepository.save(c);
        return ContentMapper.toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ContentDTO> getAllContents() {
        return contentRepository.findAll().stream()
                .map(ContentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContentDTO> getContentsBySection(Long sectionId) {
        return contentRepository.findBySectionId(sectionId).stream()
                .map(ContentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContentDTO getContentById(Long id) {
        Content c = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        return ContentMapper.toDTO(c);
    }

    public ContentDTO updateContent(Long id, ContentUpdateDTO dto) {
        Content c = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        Section newSection = null;
        if (dto.getSectionId() != null) {
            newSection = sectionRepository.findById(dto.getSectionId())
                    .orElseThrow(() -> new RuntimeException("Section (for move) not found"));
        }

        ContentMapper.applyUpdate(c, dto, newSection);
        Content saved = contentRepository.save(c);
        return ContentMapper.toDTO(saved);
    }

    public void deleteContent(Long id) {
        contentRepository.deleteById(id);
    }
}
