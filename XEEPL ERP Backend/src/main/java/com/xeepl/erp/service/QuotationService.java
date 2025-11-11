package com.xeepl.erp.service;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.entity.*;
import com.xeepl.erp.mapper.QuotationMapper;
import com.xeepl.erp.repository.*;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
public class QuotationService {
    private final QuotationRepository quotationRepository;
    private final QuotationLineRepository quotationLineRepository;
    private final UserRepository userRepository;
    private final CatalogRepository catalogRepository;
    private final QuotationSnapshotRepository quotationSnapshotRepository;
    private final QuotationMapper quotationMapper;

    // 1. List all quotations
    public List<QuotationDTO> listQuotations() {
        return quotationRepository.findAll()
                .stream()
                .map(quotationMapper::toDto)
                .toList();
    }

    // 2. Get a specific quotation by ID (all lines, including removed)
    public QuotationDTO getQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        return quotationMapper.toDtoWithAllLines(quotation);
    }

    // 2b. Get quotation with option to include removed raw lines
    public QuotationDTO getQuotation(Long id, boolean includeRemoved) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        return includeRemoved ? quotationMapper.toDtoWithAllLines(quotation) : quotationMapper.toDto(quotation);
    }

    // 3. Create a new quotation with lines
    @Transactional
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

        List<QuotationLine> lines = new ArrayList<>();
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (QuotationLineCreateDTO item : dto.getItems()) {
                QuotationLine line = new QuotationLine();
                line.setItemDescription(item.getItemDescription());
                line.setQuantity(item.getQuantity());
                line.setUnitPrice(item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice());
                line.setQuotation(quotation);
                line.setIsRawMaterial(item.getIsRawMaterial() != null ? item.getIsRawMaterial() : false);
                line.setParentItemId(item.getParentItemId());
                line.setRawId(item.getRawId());
                line.setRemoved(false); // on creation, lines are not removed
                line.calculateTotal();
                lines.add(line);
            }
        }
        quotation.setItems(lines);

        Quotation saved = quotationRepository.save(quotation);
        return quotationMapper.toDtoWithAllLines(saved);
    }

    // 4. Update an existing quotation (replace lines, keep removed flag if needed)
    @Transactional
    public QuotationDTO updateQuotation(Long id, QuotationUpdateDTO dto) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        quotation.setName(dto.getName());
        quotation.setDate(dto.getDate());
        quotation.setExpiryDate(dto.getExpiryDate());
        if (dto.getStatus() != null)
            quotation.setStatus(QuotationStatus.valueOf(dto.getStatus()));

        if (dto.getCustomerId() != null) {
            User customer = userRepository.findById(dto.getCustomerId()).orElse(null);
            quotation.setCustomer(customer);
        }

        if (dto.getCatalogIds() != null) {
            quotation.setLinkedCatalogs(catalogRepository.findAllById(dto.getCatalogIds()));
        }

        // Replace lines, preserving removed flag on existing lines where possible
        quotation.getItems().clear();
        List<QuotationLine> updatedLines = new ArrayList<>();
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (QuotationLineUpdateDTO item : dto.getItems()) {
                QuotationLine line = new QuotationLine();

                // KEEP REMOVED STATE if such line already exists:
                if (item.getId() != null) {
                    QuotationLine old = quotationLineRepository.findById(item.getId()).orElse(null);
                    if (old != null && Boolean.TRUE.equals(old.getRemoved())) {
                        line.setRemoved(true);
                    }
                }
                line.setItemDescription(item.getItemDescription());
                line.setQuantity(item.getQuantity());
                line.setUnitPrice(item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice());
                line.setQuotation(quotation);
                line.setIsRawMaterial(item.getIsRawMaterial() != null ? item.getIsRawMaterial() : false);
                line.setParentItemId(item.getParentItemId());
                line.setRawId(item.getRawId());
                line.calculateTotal();

                updatedLines.add(line);
            }
        }
        quotation.getItems().addAll(updatedLines);

        Quotation saved = quotationRepository.save(quotation);
        return quotationMapper.toDtoWithAllLines(saved);
    }

    // 5. Mark a QuotationLine as removed (soft delete)
    @Transactional
    public void markLineRemoved(Long lineId) {
        QuotationLine line = quotationLineRepository.findById(lineId).orElseThrow();
        line.setRemoved(true);
        quotationLineRepository.save(line);
    }

    // 6. Restore a previously removed QuotationLine
    @Transactional
    public void restoreRemovedLine(Long lineId) {
        QuotationLine line = quotationLineRepository.findById(lineId).orElseThrow();
        line.setRemoved(false);
        quotationLineRepository.save(line);
    }

    // 7. Edit a Quotation line (qty, price, description, etc.)
    @Transactional
    public QuotationLineDTO editLine(Long lineId, QuotationLineUpdateDTO dto) {
        QuotationLine line = quotationLineRepository.findById(lineId).orElseThrow();
        if (dto.getQuantity() != null) line.setQuantity(dto.getQuantity());
        if (dto.getUnitPrice() != null) line.setUnitPrice(dto.getUnitPrice());
        if (dto.getItemDescription() != null) line.setItemDescription(dto.getItemDescription());
        // extend to other fields as needed
        line.calculateTotal();
        QuotationLine saved = quotationLineRepository.save(line);
        return quotationMapper.toLineDto(saved);
    }

    // 8. Link catalogs to a quotation
    @Transactional
    public QuotationDTO linkCatalogsToQuotation(Long quotationId, List<Long> catalogIds) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        List<Catalog> catalogs = catalogRepository.findAllById(catalogIds);
        quotation.setLinkedCatalogs(catalogs);
        Quotation saved = quotationRepository.save(quotation);
        return quotationMapper.toDto(saved);
    }

    // 9. Download linked catalogs as ZIP file
    public void downloadCatalogsAsZip(Long quotationId, HttpServletResponse response) throws IOException {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        response.setContentType("application/zip");
        response.setHeader("Content-Disposition",
                "attachment; filename=quotation_" + quotationId + "_catalogs.zip");

        try (ZipOutputStream zos = new ZipOutputStream(response.getOutputStream())) {
            for (Catalog catalog : quotation.getLinkedCatalogs()) {
                File file = new File("uploads/" + catalog.getFilePath());
                if (file.exists()) {
                    ZipEntry entry = new ZipEntry(catalog.getFileName());
                    zos.putNextEntry(entry);
                    Files.copy(file.toPath(), zos);
                    zos.closeEntry();
                }
            }
        }
    }

    // 10. Finalize quotation (make immutable to normal edit flow) and snapshot
    @Transactional
    public QuotationDTO finalizeQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        quotation.setStatus(QuotationStatus.FINALIZED);
        Quotation saved = quotationRepository.save(quotation);

        // snapshot lines (simple JSON string snapshot to avoid schema sprawl)
        // Compose a minimal JSON manually (no extra deps)
        StringBuilder json = new StringBuilder();
        json.append("{\"quotationId\":").append(saved.getId()).append(",\"lines\":[");
        List<QuotationLine> lines = saved.getItems();
        for (int i = 0; i < lines.size(); i++) {
            QuotationLine l = lines.get(i);
            json.append("{")
                    .append("\"id\":").append(l.getId()).append(",")
                    .append("\"desc\":\"").append(escapeJson(l.getItemDescription())).append("\",")
                    .append("\"qty\":").append(l.getQuantity()).append(",")
                    .append("\"unitPrice\":\"").append(l.getUnitPrice()).append("\",")
                    .append("\"total\":\"").append(l.getTotal()).append("\",")
                    .append("\"isRaw\":").append(Boolean.TRUE.equals(l.getIsRawMaterial())).append(",")
                    .append("\"parentId\":").append(l.getParentItemId() == null ? "null" : l.getParentItemId()).append(",")
                    .append("\"rawId\":").append(l.getRawId() == null ? "null" : l.getRawId()).append(",")
                    .append("\"removed\":").append(Boolean.TRUE.equals(l.getRemoved()))
                    .append("}");
            if (i < lines.size() - 1) json.append(",");
        }
        json.append("]}");

        QuotationSnapshot snapshot = new QuotationSnapshot();
        snapshot.setQuotationId(saved.getId());
        snapshot.setPayloadJson(json.toString());
        quotationSnapshotRepository.save(snapshot);

        return quotationMapper.toDtoWithAllLines(saved);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    // 11. Delete a quotation by ID
    @Transactional
    public void deleteQuotation(Long id) {
        quotationRepository.deleteById(id);
    }
}
