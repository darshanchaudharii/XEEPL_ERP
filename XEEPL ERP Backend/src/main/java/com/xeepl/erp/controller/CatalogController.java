package com.xeepl.erp.controller;
import com.xeepl.erp.entity.Catalog;
import  com.xeepl.erp.repository.CatalogRepository;
import com.xeepl.erp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xeepl.erp.dto.CatalogCreateDTO;
import com.xeepl.erp.dto.CatalogDTO;
import com.xeepl.erp.dto.CatalogUpdateDTO;
import com.xeepl.erp.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;


import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/catalogs")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;
    private final CatalogRepository catalogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<List<CatalogDTO>> listCatalogs(
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(catalogService.listCatalogs(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CatalogDTO> getCatalog(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.getCatalogById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<CatalogDTO> createCatalog(
            @RequestPart("metadata") String metadataJson,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        CatalogCreateDTO dto = objectMapper.readValue(metadataJson, CatalogCreateDTO.class);
        CatalogDTO created = catalogService.createCatalog(dto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<CatalogDTO> updateCatalog(
            @PathVariable Long id,
            @RequestPart("metadata") String metadataJson,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        CatalogUpdateDTO dto = objectMapper.readValue(metadataJson, CatalogUpdateDTO.class);
        CatalogDTO updated = catalogService.updateCatalog(id, dto, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCatalog(@PathVariable Long id) throws IOException {
        catalogService.deleteCatalog(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/download/files/{id}")
    public ResponseEntity<Resource> downloadCatalogFile(@PathVariable Long id) throws Exception {
        Catalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catalog not found with id: " + id));

        // Use the absolute file path directly for testing
        // To make it robust, you could use catalog.getFilePath() if it stores the full absolute path, or prepend as shown below.
        String absoluteFilePath = "D:/XEEPL ERP/XEEPL ERP Backend/uploads/" + catalog.getFilePath().replace("\\", "/");
        Path filePath = Paths.get(absoluteFilePath).normalize();

        System.out.println("Resolved file path: " + filePath.toAbsolutePath()); // Debug print

        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found: " + catalog.getFileName());
        }

        String contentType = catalog.getFileType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + catalog.getFileName() + "\"")
                .body(resource);
    }

}
