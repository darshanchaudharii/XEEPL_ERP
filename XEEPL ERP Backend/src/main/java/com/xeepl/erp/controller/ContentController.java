package com.xeepl.erp.controller;

import com.xeepl.erp.dto.ContentCreateDTO;
import com.xeepl.erp.dto.ContentDTO;
import com.xeepl.erp.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<List<ContentDTO>> getAllContents(
            @RequestParam(required = false) Long sectionId) {
        List<ContentDTO> contents = (sectionId != null)
                ? contentService.getContentsBySection(sectionId)
                : contentService.getAllContents();
        return ResponseEntity.ok(contents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentDTO> getContentById(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getContentById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ContentDTO> createContent(
            @ModelAttribute ContentCreateDTO dto,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        ContentDTO created = contentService.createContent(dto, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        contentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }
}
