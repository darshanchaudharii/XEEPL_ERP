package com.xeepl.erp.service;

import com.xeepl.erp.dto.CatalogCreateDTO;
import com.xeepl.erp.dto.CatalogDTO;
import com.xeepl.erp.dto.CatalogUpdateDTO;
import com.xeepl.erp.entity.Catalog;
import com.xeepl.erp.exception.ResourceNotFoundException;
import com.xeepl.erp.mapper.CatalogMapper;
import com.xeepl.erp.repository.CatalogRepository;
import com.xeepl.erp.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CatalogService {

    private final CatalogRepository catalogRepository;
    private final CatalogMapper catalogMapper;
    private final FileUploadUtil fileUploadUtil;

    @Value("${app.download.base-url:http://localhost:8080}")
    private String downloadBaseUrl;

    public List<CatalogDTO> listCatalogs(String search) {
        List<Catalog> catalogs;
        if (search == null || search.isBlank()) {
            catalogs = catalogRepository.findAll();
        } else {
            catalogs = catalogRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search);
        }
        return catalogs.stream()
                .map(c -> catalogMapper.toDto(c, downloadBaseUrl + "/api/catalogs/download/" + c.getFilePath()))
                .collect(Collectors.toList());
    }

    public CatalogDTO getCatalogById(Long id) {
        Catalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catalog not found"));
        return catalogMapper.toDto(catalog, downloadBaseUrl + "/api/catalogs/download/" + catalog.getFilePath());
    }

    public CatalogDTO createCatalog(CatalogCreateDTO dto, MultipartFile file) throws IOException {
        fileUploadUtil.validateFile(file);
        String savedFileName = fileUploadUtil.saveFile(file, "catalog-files");


        Catalog catalog = new Catalog();
        catalog.setTitle(dto.getTitle());
        catalog.setDescription(dto.getDescription());
        catalog.setFileName(file.getOriginalFilename());
        catalog.setFileType(file.getContentType());
        catalog.setFileSize(file.getSize());
        catalog.setFilePath(savedFileName);

        Catalog savedCatalog = catalogRepository.save(catalog);
        return catalogMapper.toDto(savedCatalog, downloadBaseUrl + "/api/catalogs/download/" + savedFileName);
    }

    public CatalogDTO updateCatalog(Long id, CatalogUpdateDTO dto, MultipartFile file) throws IOException {
        Catalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catalog not found"));

        catalog.setTitle(dto.getTitle());
        catalog.setDescription(dto.getDescription());

        // If a new file is uploaded, replace the old one
        if (file != null && !file.isEmpty()) {
            fileUploadUtil.validateFile(file);
            if (catalog.getFilePath() != null) {
                fileUploadUtil.deleteFile(catalog.getFilePath());
            }
            String savedFileName = fileUploadUtil.saveFile(file, "catalog-files");
            catalog.setFileName(file.getOriginalFilename());
            catalog.setFileType(file.getContentType());
            catalog.setFileSize(file.getSize());
            catalog.setFilePath(savedFileName);
        }
        Catalog updated = catalogRepository.save(catalog);
        return catalogMapper.toDto(updated, downloadBaseUrl + "/api/catalogs/download/" + updated.getFilePath());
    }

    public void deleteCatalog(Long id) throws IOException {
        Catalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catalog not found"));
        if (catalog.getFilePath() != null) {
            fileUploadUtil.deleteFile(catalog.getFilePath());
        }
        catalogRepository.delete(catalog);
    }
}
