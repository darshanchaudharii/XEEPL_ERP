package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.CatalogDTO;
import com.xeepl.erp.entity.Catalog;
import org.springframework.stereotype.Component;

@Component
public class CatalogMapper {
    public CatalogDTO toDto(Catalog catalog, String downloadUrl) {
        CatalogDTO dto = new CatalogDTO();
        dto.setId(catalog.getId());
        dto.setTitle(catalog.getTitle());
        dto.setDescription(catalog.getDescription());
        dto.setFileName(catalog.getFileName());
        dto.setFileType(catalog.getFileType());
        dto.setFileSize(catalog.getFileSize());
        dto.setCreatedOn(catalog.getCreatedOn() == null ? null : catalog.getCreatedOn().toString());
        dto.setUpdatedOn(catalog.getUpdatedOn() == null ? null : catalog.getUpdatedOn().toString());
        dto.setDownloadUrl(downloadUrl);
        return dto;
    }
}
