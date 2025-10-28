package com.xeepl.erp.service;

import com.xeepl.erp.dto.SectionCreateDTO;
import com.xeepl.erp.dto.SectionDTO;
import com.xeepl.erp.dto.SectionUpdateDTO;
import com.xeepl.erp.entity.Section;
import com.xeepl.erp.exception.ResourceNotFoundException;
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
    private final SectionMapper sectionMapper;

    public List<SectionDTO> getAllSections() {
        List<Section> sections = sectionRepository.findAll();
        return sections.stream().map(sectionMapper::toDto).collect(Collectors.toList());
    }

    public SectionDTO getSectionById(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + id));
        return sectionMapper.toDto(section);
    }

    public SectionDTO createSection(SectionCreateDTO dto) {
        if (dto.getSectionName() == null || dto.getSectionName().isBlank()) {
            throw new IllegalArgumentException("Section name cannot be empty.");
        }
        if (sectionRepository.existsBySectionName(dto.getSectionName())) {
            throw new IllegalArgumentException("Section name already exists");
        }
        Section section = new Section();
        section.setSectionName(dto.getSectionName());
        return sectionMapper.toDto(sectionRepository.save(section));
    }

    public SectionDTO updateSection(Long id, SectionUpdateDTO dto) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + id));
        if (dto.getSectionName() == null || dto.getSectionName().isBlank()) {
            throw new IllegalArgumentException("Section name cannot be empty.");
        }
        section.setSectionName(dto.getSectionName());
        return sectionMapper.toDto(sectionRepository.save(section));
    }

    public void deleteSection(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + id));
        sectionRepository.delete(section);
    }
}
