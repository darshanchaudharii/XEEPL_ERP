package com.xeepl.erp.service;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.entity.*;
import com.xeepl.erp.mapper.QuotationMapper;
import com.xeepl.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotationService {
    private final QuotationRepository quotationRepository;
    private final QuotationLineRepository quotationLineRepository;
    private final UserRepository userRepository;
    private final CatalogRepository catalogRepository;
    private final QuotationMapper quotationMapper;
    private final PdfExportService pdfExportService;

    // List all quotations
    public List<QuotationDTO> listQuotations() {
        return quotationRepository.findAll()
                .stream()
                .map(quotationMapper::toDto)
                .toList();
    }

    // Get a specific quotation by ID
    public QuotationDTO getQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        return quotationMapper.toDto(quotation);
    }

    // Create a new quotation
    public QuotationDTO createQuotation(QuotationCreateDTO dto) {
        Quotation quotation = new Quotation();
        quotation.setName(dto.getName());
        quotation.setDate(dto.getDate());
        quotation.setExpiryDate(dto.getExpiryDate());
        quotation.setStatus(QuotationStatus.DRAFT);

        if (dto.getCustomerId() != null) {
            User customer = userRepository.findById(dto.getCustomerId()).orElse(null);
            quotation.setCustomer(customer);
        }

        if (dto.getCatalogIds() != null && !dto.getCatalogIds().isEmpty()) {
            quotation.setLinkedCatalogs(catalogRepository.findAllById(dto.getCatalogIds()));
        }

        // Save lines
        List<QuotationLine> lines = new ArrayList<>();
        if (dto.getItems() != null) {
            for (QuotationLineCreateDTO item : dto.getItems()) {
                QuotationLine line = new QuotationLine();
                line.setItemDescription(item.getItemDescription());
                line.setQuantity(item.getQuantity());
                line.setUnitPrice(item.getUnitPrice());
                line.setQuotation(quotation);
                line.calculateTotal();
                lines.add(line);
            }
        }
        quotation.setItems(lines);

        Quotation saved = quotationRepository.save(quotation);
        return quotationMapper.toDto(saved);
    }

    // Update an existing quotation
    public QuotationDTO updateQuotation(Long id, QuotationUpdateDTO dto) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        quotation.setName(dto.getName());
        quotation.setDate(dto.getDate());
        quotation.setExpiryDate(dto.getExpiryDate());
        if (dto.getStatus() != null) {
            quotation.setStatus(QuotationStatus.valueOf(dto.getStatus()));
        }

        if (dto.getCustomerId() != null) {
            User customer = userRepository.findById(dto.getCustomerId()).orElse(null);
            quotation.setCustomer(customer);
        }

        if (dto.getCatalogIds() != null) {
            quotation.setLinkedCatalogs(catalogRepository.findAllById(dto.getCatalogIds()));
        }

        // Replace lines with new ones (orphanRemoval=true works)
        quotation.getItems().clear();
        List<QuotationLine> updatedLines = new ArrayList<>();
        if (dto.getItems() != null) {
            for (QuotationLineUpdateDTO item : dto.getItems()) {
                QuotationLine line = new QuotationLine();
                line.setItemDescription(item.getItemDescription());
                line.setQuantity(item.getQuantity());
                line.setUnitPrice(item.getUnitPrice());
                line.setQuotation(quotation);
                line.calculateTotal();
                updatedLines.add(line);
            }
        }
        quotation.getItems().addAll(updatedLines);

        Quotation saved = quotationRepository.save(quotation);
        return quotationMapper.toDto(saved);
    }

    // Delete a quotation by ID
    public void deleteQuotation(Long id) {
        quotationRepository.deleteById(id);
    }

    // Export PDF for a quotation
    public byte[] exportQuotationPdf(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        return pdfExportService.exportQuotationPdf(quotation);
    }
}
