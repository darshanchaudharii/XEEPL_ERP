package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.entity.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuotationMapper {

    public QuotationDTO toDto(Quotation quotation) {
        return toDtoInternal(quotation, false);
    }

    public QuotationDTO toDtoWithAllLines(Quotation quotation) {
        return toDtoInternal(quotation, true);
    }

    private QuotationDTO toDtoInternal(Quotation quotation, boolean includeRemoved) {
        QuotationDTO dto = new QuotationDTO();
        dto.setId(quotation.getId());
        dto.setName(quotation.getName());
        dto.setDate(quotation.getDate());
        dto.setExpiryDate(quotation.getExpiryDate());
        dto.setStatus(quotation.getStatus().name());
        if (quotation.getCustomer() != null) {
            CustomerSummaryDTO customer = new CustomerSummaryDTO();
            customer.setId(quotation.getCustomer().getId());
            customer.setFullName(quotation.getCustomer().getFullName());
            customer.setEmail(quotation.getCustomer().getUsername());
            customer.setMobile(quotation.getCustomer().getMobile());
            dto.setCustomer(customer);
        }
        dto.setLinkedCatalogs(quotation.getLinkedCatalogs().stream()
                .map(cat -> {
                    CatalogSummaryDTO c = new CatalogSummaryDTO();
                    c.setId(cat.getId());
                    c.setTitle(cat.getTitle());
                    c.setDescription(cat.getDescription());
                    c.setLogoUrl(cat.getFilePath());
                    return c;
                }).collect(Collectors.toList()));
        // Get all items from quotation
        List<QuotationLine> allItems = quotation.getItems() != null ? quotation.getItems() : new ArrayList<>();
        
        // Filter items based on includeRemoved flag
        // If includeRemoved is true, include ALL items (both removed and not removed)
        // If includeRemoved is false, only include items where removed is NOT true
        List<QuotationLineDTO> filteredItems = allItems.stream()
                .filter(line -> {
                    boolean isRemoved = Boolean.TRUE.equals(line.getRemoved());
                    return includeRemoved || !isRemoved;
                })
                .map(line -> toLineDto(line))
                .collect(Collectors.toList());
        
        dto.setItems(filteredItems);
        return dto;
    }

    public QuotationLineDTO toLineDto(QuotationLine line) {
        QuotationLineDTO l = new QuotationLineDTO();
        l.setId(line.getId());
        l.setItemDescription(line.getItemDescription());
        l.setQuantity(line.getQuantity());
        l.setUnitPrice(line.getUnitPrice());
        l.setTotal(line.getTotal());
        l.setIsRawMaterial(line.getIsRawMaterial());
        l.setParentItemId(line.getParentItemId());
        l.setRawId(line.getRawId());
        l.setRemoved(line.getRemoved());
        return l;
    }
}