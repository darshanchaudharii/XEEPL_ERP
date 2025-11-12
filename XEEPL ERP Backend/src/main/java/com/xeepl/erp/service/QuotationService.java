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
import java.nio.file.Path;
import java.nio.file.Paths;
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
        // Use fetch join to ensure all items (including removed) are loaded
        Quotation quotation = quotationRepository.findByIdWithAllItems(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        return quotationMapper.toDtoWithAllLines(quotation);
    }

    // 2b. Get quotation with option to include removed raw lines
    public QuotationDTO getQuotation(Long id, boolean includeRemoved) {
        // Use fetch join to ensure all items (including removed) are loaded
        Quotation quotation = quotationRepository.findByIdWithAllItems(id)
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

        // Replace lines, preserving removed flag from DTO
        quotation.getItems().clear();
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            // First pass: Save items (non-raw materials) and track their new IDs
            // This allows raw materials to reference items by their position
            List<QuotationLine> savedItems = new ArrayList<>();
            
            for (QuotationLineUpdateDTO item : dto.getItems()) {
                // Skip raw materials in first pass - we'll handle them after items are saved
                if (Boolean.TRUE.equals(item.getIsRawMaterial())) {
                    continue;
                }
                
                QuotationLine line = new QuotationLine();

                // Set removed flag from DTO (if provided), otherwise check existing line
                if (item.getRemoved() != null) {
                    line.setRemoved(item.getRemoved());
                } else if (item.getId() != null) {
                    // Fallback: check existing line if removed flag not in DTO
                    QuotationLine old = quotationLineRepository.findById(item.getId()).orElse(null);
                    if (old != null && Boolean.TRUE.equals(old.getRemoved())) {
                        line.setRemoved(true);
                    } else {
                        line.setRemoved(false);
                    }
                } else {
                    line.setRemoved(false);
                }

                line.setItemDescription(item.getItemDescription());
                line.setQuantity(item.getQuantity());
                line.setUnitPrice(item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice());
                line.setQuotation(quotation);
                line.setIsRawMaterial(false);
                line.setParentItemId(null); // Items don't have parents
                line.setRawId(item.getRawId());
                line.calculateTotal();

                savedItems.add(line);
            }
            
            // Save items first to get their IDs
            quotation.getItems().addAll(savedItems);
            Quotation savedQuotation = quotationRepository.save(quotation);
            
            // Create a map from old ID to new ID for items (for parentItemId mapping)
            // Also create a map from position to item ID
            java.util.Map<Long, Long> oldIdToNewIdMap = new java.util.HashMap<>();
            java.util.Map<Integer, Long> positionToItemIdMap = new java.util.HashMap<>();
            List<QuotationLine> finalItems = savedQuotation.getItems();
            int itemIndex = 0;
            for (int i = 0; i < dto.getItems().size() && itemIndex < finalItems.size(); i++) {
                QuotationLineUpdateDTO dtoItem = dto.getItems().get(i);
                if (!Boolean.TRUE.equals(dtoItem.getIsRawMaterial())) {
                    if (dtoItem.getId() != null) {
                        oldIdToNewIdMap.put(dtoItem.getId(), finalItems.get(itemIndex).getId());
                    }
                    positionToItemIdMap.put(i, finalItems.get(itemIndex).getId());
                    itemIndex++;
                }
            }
            
            // Second pass: Save raw materials with correct parentItemId references
            List<QuotationLine> rawMaterials = new ArrayList<>();
            for (int i = 0; i < dto.getItems().size(); i++) {
                QuotationLineUpdateDTO item = dto.getItems().get(i);
                
                // Only process raw materials
                if (!Boolean.TRUE.equals(item.getIsRawMaterial())) {
                    continue;
                }
                
                QuotationLine line = new QuotationLine();

                // Set removed flag from DTO - prioritize DTO value
                if (item.getRemoved() != null) {
                    // Explicitly set from DTO
                    line.setRemoved(item.getRemoved());
                } else if (item.getId() != null) {
                    // Fallback: check existing line if removed flag not in DTO
                    QuotationLine old = quotationLineRepository.findById(item.getId()).orElse(null);
                    if (old != null && Boolean.TRUE.equals(old.getRemoved())) {
                        line.setRemoved(true);
                    } else {
                        line.setRemoved(false);
                    }
                } else {
                    // New line - default to not removed
                    line.setRemoved(false);
                }

                line.setItemDescription(item.getItemDescription());
                line.setQuantity(item.getQuantity());
                line.setUnitPrice(item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice());
                line.setQuotation(savedQuotation);
                line.setIsRawMaterial(true);
                line.setRawId(item.getRawId());
                line.calculateTotal();
                
                // Map parentItemId: if it's a temporary ID or references an item, find the correct parent
                Long parentItemId = item.getParentItemId();
                if (parentItemId != null) {
                    // Try to map from old ID to new ID
                    if (oldIdToNewIdMap.containsKey(parentItemId)) {
                        line.setParentItemId(oldIdToNewIdMap.get(parentItemId));
                    } else {
                        // If not found in map, try to find the parent by looking backwards for the last item
                        // Find the most recent item before this raw material in the original list
                        for (int j = i - 1; j >= 0; j--) {
                            QuotationLineUpdateDTO prevItem = dto.getItems().get(j);
                            if (!Boolean.TRUE.equals(prevItem.getIsRawMaterial())) {
                                // This is an item - find its new ID
                                if (positionToItemIdMap.containsKey(j)) {
                                    line.setParentItemId(positionToItemIdMap.get(j));
                                }
                                break;
                            }
                        }
                    }
                } else {
                    // No parentItemId specified - find the last item before this raw material
                    for (int j = i - 1; j >= 0; j--) {
                        QuotationLineUpdateDTO prevItem = dto.getItems().get(j);
                        if (!Boolean.TRUE.equals(prevItem.getIsRawMaterial())) {
                            if (positionToItemIdMap.containsKey(j)) {
                                line.setParentItemId(positionToItemIdMap.get(j));
                            }
                            break;
                        }
                    }
                }

                rawMaterials.add(line);
            }
            
            // Add raw materials to quotation
            savedQuotation.getItems().addAll(rawMaterials);
            quotation = quotationRepository.save(savedQuotation);
        }

        return quotationMapper.toDtoWithAllLines(quotation);
    }

    // 5. Edit a Quotation line (qty, price, description, etc.)
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

    // 6. Soft delete a quotation line (works even for finalized quotations)
    @Transactional
    public QuotationLineDTO removeLine(Long lineId) {
        QuotationLine line = quotationLineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Quotation line not found"));
        line.markRemoved();
        QuotationLine saved = quotationLineRepository.save(line);
        return quotationMapper.toLineDto(saved);
    }

    // 7. Restore a removed quotation line (works even for finalized quotations)
    @Transactional
    public QuotationLineDTO undoRemoveLine(Long lineId) {
        QuotationLine line = quotationLineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Quotation line not found"));
        line.undoRemoved();
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

        // Check if there are any linked catalogs
        if (quotation.getLinkedCatalogs() == null || quotation.getLinkedCatalogs().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"No catalogs linked to this quotation\"}");
            return;
        }

        // Use absolute path based on working directory (consistent with WebConfig and CatalogController)
        String userDir = System.getProperty("user.dir");
        Path uploadBasePath = Paths.get(userDir, "uploads").normalize();
        
        // First, check which files exist before creating the zip
        List<File> filesToZip = new ArrayList<>();
        List<String> fileNames = new ArrayList<>();
        
        for (Catalog catalog : quotation.getLinkedCatalogs()) {
            if (catalog.getFilePath() == null || catalog.getFilePath().isEmpty()) {
                continue; // Skip catalogs with no file path
            }
            
            // Build absolute file path using Paths for cross-platform compatibility
            Path filePath = uploadBasePath.resolve(catalog.getFilePath()).normalize();
            File file = filePath.toFile();
            
            if (file.exists() && file.isFile()) {
                filesToZip.add(file);
                fileNames.add(catalog.getFileName() != null ? catalog.getFileName() : file.getName());
            }
        }
        
        // If no files found, return error
        if (filesToZip.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"No catalog files found to download\"}");
            return;
        }

        // Set headers for zip download
        response.setContentType("application/zip");
        response.setHeader("Content-Disposition",
                "attachment; filename=quotation_" + quotationId + "_catalogs.zip");
        
        // Create zip with existing files
        try (ZipOutputStream zos = new ZipOutputStream(response.getOutputStream())) {
            for (int i = 0; i < filesToZip.size(); i++) {
                File file = filesToZip.get(i);
                String fileName = fileNames.get(i);
                ZipEntry entry = new ZipEntry(fileName);
                zos.putNextEntry(entry);
                Files.copy(file.toPath(), zos);
                zos.closeEntry();
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
