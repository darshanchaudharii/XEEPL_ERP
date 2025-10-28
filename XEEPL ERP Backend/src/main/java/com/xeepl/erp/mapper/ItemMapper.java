package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.ItemDTO;
import com.xeepl.erp.entity.Item;
import org.springframework.stereotype.Component;

@Component
public class ItemMapper {
    public ItemDTO toDto(Item item) {
        ItemDTO dto = new ItemDTO();
        dto.setId(item.getId());
        dto.setItemName(item.getItemName());
        if (item.getItemCategory() != null) {
            dto.setItemCategoryId(item.getItemCategory().getId());
            dto.setItemCategoryName(item.getItemCategory().getTitle());
        }
        if (item.getItemSubcategory() != null) {
            dto.setItemSubcategoryId(item.getItemSubcategory().getId());
            dto.setItemSubcategoryName(item.getItemSubcategory().getTitle());
        }
        if (item.getSupplier() != null) {
            dto.setSupplierId(item.getSupplier().getId());
            dto.setSupplierName(item.getSupplier().getFullName());
        }
        dto.setItemQty(item.getItemQty());
        dto.setItemPrice(item.getItemPrice());
        dto.setItemCode(item.getItemCode());
        dto.setDescription(item.getDescription());
        if (item.getCreatedAt() != null) dto.setCreatedAt(item.getCreatedAt().toString());
        if (item.getUpdatedAt() != null) dto.setUpdatedAt(item.getUpdatedAt().toString());
        return dto;
    }
}
