package com.xeepl.erp.mapper;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.entity.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class QuotationMapper {

    public QuotationDTO toDto(Quotation quotation) {
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
        dto.setItems(quotation.getItems().stream()
                .map(line -> {
                    QuotationLineDTO l = new QuotationLineDTO();
                    l.setId(line.getId());
                    l.setItemDescription(line.getItemDescription());
                    l.setQuantity(line.getQuantity());
                    l.setUnitPrice(line.getUnitPrice());
                    l.setTotal(line.getTotal());
                    return l;
                }).collect(Collectors.toList()));
        return dto;
    }
}
