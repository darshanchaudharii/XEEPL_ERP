package com.xeepl.erp.service;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.entity.Section;
import com.xeepl.erp.mapper.SectionMapper;
import com.xeepl.erp.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SectionService {

    private final SectionRepository sectionRepository;

    public SectionDTO createSection(SectionCreateDTO dto) {
        Section s = new Section();
        s.setTitle(dto.getTitle());
        Section saved = sectionRepository.save(s);
        return SectionMapper.toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<SectionDTO> getAllSections() {
        return sectionRepository.findAll().stream()
                .map(SectionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SectionDTO getSectionById(Long id) {
        Section s = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        return SectionMapper.toDTO(s);
    }

    public SectionDTO updateSection(Long id, SectionUpdateDTO dto) {
        Section s = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        if (dto.getTitle() != null) s.setTitle(dto.getTitle());
        Section saved = sectionRepository.save(s);
        return SectionMapper.toDTO(saved);
    }

    public void deleteSection(Long id) {
        sectionRepository.deleteById(id);
    }
}
