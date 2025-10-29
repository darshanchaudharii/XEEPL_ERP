package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.RawMaterialDTO;
import com.xeepl.erp.entity.RawMaterial;
import org.springframework.stereotype.Component;

@Component
public class RawMaterialMapper {
    public RawMaterialDTO toDto(RawMaterial rawMaterial) {
        RawMaterialDTO dto = new RawMaterialDTO();
        dto.setId(rawMaterial.getId());
        dto.setName(rawMaterial.getName());
        dto.setQuantity(rawMaterial.getQuantity());
        dto.setPrice(rawMaterial.getPrice());
        dto.setCode(rawMaterial.getCode());
        if (rawMaterial.getLinkedItem() != null) {
            dto.setLinkedItemId(rawMaterial.getLinkedItem().getId());
            dto.setLinkedItemName(rawMaterial.getLinkedItem().getItemName());
        }
        if (rawMaterial.getSupplier() != null) {
            dto.setSupplierId(rawMaterial.getSupplier().getId());
            dto.setSupplierName(rawMaterial.getSupplier().getFullName());
        }
        dto.setAddInQuotation(rawMaterial.getAddInQuotation());
        dto.setDescription(rawMaterial.getDescription());
        if (rawMaterial.getCreatedAt() != null) dto.setCreatedAt(rawMaterial.getCreatedAt().toString());
        if (rawMaterial.getUpdatedAt() != null) dto.setUpdatedAt(rawMaterial.getUpdatedAt().toString());
        return dto;
    }
}
