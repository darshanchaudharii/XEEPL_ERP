package com.xeepl.erp.controller;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @PostMapping
    public ResponseEntity<ContentDTO> create(@Valid @RequestBody ContentCreateDTO dto) {
        return ResponseEntity.status(201).body(contentService.createContent(dto));
    }

    @GetMapping
    public ResponseEntity<List<ContentDTO>> getAll() {
        return ResponseEntity.ok(contentService.getAllContents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getContentById(id));
    }

    @GetMapping("/by-section/{sectionId}")
    public ResponseEntity<List<ContentDTO>> getBySection(@PathVariable Long sectionId) {
        return ResponseEntity.ok(contentService.getContentsBySection(sectionId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentDTO> update(@PathVariable Long id, @RequestBody ContentUpdateDTO dto) {
        return ResponseEntity.ok(contentService.updateContent(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }
}
