package com.xeepl.erp.controller;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.service.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;

    @PostMapping
    public ResponseEntity<SectionDTO> create(@Valid @RequestBody SectionCreateDTO dto) {
        return ResponseEntity.status(201).body(sectionService.createSection(dto));
    }

    @GetMapping
    public ResponseEntity<List<SectionDTO>> getAll() {
        return ResponseEntity.ok(sectionService.getAllSections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectionDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sectionService.getSectionById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SectionDTO> update(@PathVariable Long id, @RequestBody SectionUpdateDTO dto) {
        return ResponseEntity.ok(sectionService.updateSection(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }
}
