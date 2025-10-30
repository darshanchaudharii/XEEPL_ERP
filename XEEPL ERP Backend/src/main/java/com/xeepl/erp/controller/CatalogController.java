package com.xeepl.erp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xeepl.erp.dto.CatalogCreateDTO;
import com.xeepl.erp.dto.CatalogDTO;
import com.xeepl.erp.dto.CatalogUpdateDTO;
import com.xeepl.erp.service.CatalogService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/catalogs")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;
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

    @GetMapping("/download/{filename}")
    public void downloadFile(@PathVariable String filename, HttpServletResponse response) throws IOException {
        Path file = Paths.get("uploads/catalog-files", filename);
        if (Files.exists(file)) {
            response.setContentType(Files.probeContentType(file));
            response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
            try (InputStream in = Files.newInputStream(file);
                 OutputStream out = response.getOutputStream()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
                out.flush();
            }
        } else {
            response.sendError(404, "File not found");
        }
    }
}
