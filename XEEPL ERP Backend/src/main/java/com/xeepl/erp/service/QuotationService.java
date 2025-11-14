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

    public List<QuotationDTO> listQuotations() {
        return quotationRepository.findAll()
                .stream()
                .map(quotationMapper::toDto)
                .toList();
    }

    public QuotationDTO getQuotation(Long id) {
        Quotation quotation = quotationRepository.findByIdWithAllItems(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        return quotationMapper.toDtoWithAllLines(quotation);
    }

    public QuotationDTO getQuotation(Long id, boolean includeRemoved) {
        Quotation quotation = quotationRepository.findByIdWithAllItems(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        
        return includeRemoved ? quotationMapper.toDtoWithAllLines(quotation) : quotationMapper.toDto(quotation);
    }

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
            int sequence = 0;
            for (QuotationLineCreateDTO item : dto.getItems()) {
                QuotationLine line = new QuotationLine();
                line.setItemDescription(item.getItemDescription());
                line.setQuantity(item.getQuantity());
                line.setUnitPrice(item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice());
                line.setQuotation(quotation);
                line.setIsRawMaterial(item.getIsRawMaterial() != null ? item.getIsRawMaterial() : false);
                line.setParentItemId(item.getParentItemId());
                line.setRawId(item.getRawId());
                line.setRemoved(false);
                line.setSequence(item.getSequence() != null ? item.getSequence() : sequence++);
                line.calculateTotal();
                lines.add(line);
            }
        }
        quotation.setItems(lines);

        Quotation saved = quotationRepository.save(quotation);
        return quotationMapper.toDtoWithAllLines(saved);
    }

    @Transactional
    public QuotationDTO updateQuotation(Long id, QuotationUpdateDTO dto) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        quotation.setName(dto.getName());
        quotation.setDate(dto.getDate());
        quotation.setExpiryDate(dto.getExpiryDate());
        
        boolean isBeingFinalized = false;
        if (dto.getStatus() != null) {
            QuotationStatus newStatus = QuotationStatus.valueOf(dto.getStatus());
            QuotationStatus oldStatus = quotation.getStatus();
            isBeingFinalized = (newStatus == QuotationStatus.FINALIZED && oldStatus != QuotationStatus.FINALIZED);
            quotation.setStatus(newStatus);
        }

        if (dto.getCustomerId() != null) {
            User customer = userRepository.findById(dto.getCustomerId()).orElse(null);
            quotation.setCustomer(customer);
        }

        if (dto.getCatalogIds() != null) {
            quotation.setLinkedCatalogs(catalogRepository.findAllById(dto.getCatalogIds()));
        }

        quotation.getItems().clear();
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            List<QuotationLine> savedItems = new ArrayList<>();
            
            for (int i = 0; i < dto.getItems().size(); i++) {
                QuotationLineUpdateDTO item = dto.getItems().get(i);
                
                if (Boolean.TRUE.equals(item.getIsRawMaterial())) {
                    continue;
                }
                
                QuotationLine line = new QuotationLine();

                if (item.getRemoved() != null) {
                    line.setRemoved(item.getRemoved());
                } else if (item.getId() != null) {
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
                line.setParentItemId(null);
                line.setRawId(item.getRawId());
                int seq = item.getSequence() != null ? item.getSequence() : i;
                line.setSequence(seq);
                line.calculateTotal();

                savedItems.add(line);
            }
            
            quotation.getItems().addAll(savedItems);
            Quotation savedQuotation = quotationRepository.save(quotation);
            
            java.util.Map<Long, Long> oldIdToNewIdMap = new java.util.HashMap<>();
            java.util.Map<Integer, Long> positionToItemIdMap = new java.util.HashMap<>();
            List<QuotationLine> finalItems = savedQuotation.getItems();
            int itemIndex = 0;
            for (int i = 0; i < dto.getItems().size() && itemIndex < finalItems.size(); i++) {
                QuotationLineUpdateDTO dtoItem = dto.getItems().get(i);
                if (!Boolean.TRUE.equals(dtoItem.getIsRawMaterial())) {
                    Long newId = finalItems.get(itemIndex).getId();
                    if (dtoItem.getId() != null) {
                        oldIdToNewIdMap.put(dtoItem.getId(), newId);
                    }
                    positionToItemIdMap.put(i, newId);
                    itemIndex++;
                }
            }
            
            List<QuotationLine> rawMaterials = new ArrayList<>();
            for (int i = 0; i < dto.getItems().size(); i++) {
                QuotationLineUpdateDTO item = dto.getItems().get(i);
                
                if (!Boolean.TRUE.equals(item.getIsRawMaterial())) {
                    continue;
                }
                
                QuotationLine line = new QuotationLine();

                if (item.getRemoved() != null) {
                    line.setRemoved(item.getRemoved());
                } else if (item.getId() != null) {
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
                line.setQuotation(savedQuotation);
                line.setIsRawMaterial(true);
                line.setRawId(item.getRawId());
                line.setSequence(item.getSequence() != null ? item.getSequence() : i);
                line.calculateTotal();
                
                Long parentItemId = item.getParentItemId();
                if (parentItemId != null) {
                    if (oldIdToNewIdMap.containsKey(parentItemId)) {
                        line.setParentItemId(oldIdToNewIdMap.get(parentItemId));
                    } else {
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
                } else {
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
            
            savedQuotation.getItems().addAll(rawMaterials);
            quotation = quotationRepository.save(savedQuotation);
        } else {
            quotation = quotationRepository.save(quotation);
        }

        if (isBeingFinalized) {
            createQuotationSnapshot(quotation);
        }

        return quotationMapper.toDtoWithAllLines(quotation);
    }

    private void createQuotationSnapshot(Quotation quotation) {
        try {
            Quotation saved = quotationRepository.findByIdWithAllItems(quotation.getId())
                    .orElseThrow(() -> new RuntimeException("Quotation not found"));
            
            List<QuotationLine> lines = saved.getItems() != null ? saved.getItems() : new ArrayList<>();
            
            lines.sort((a, b) -> {
                Integer seqA = a.getSequence() != null ? a.getSequence() : 0;
                Integer seqB = b.getSequence() != null ? b.getSequence() : 0;
                return seqA.compareTo(seqB);
            });

            StringBuilder json = new StringBuilder();
            json.append("{\"quotationId\":").append(saved.getId()).append(",\"lines\":[");
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
                        .append("\"removed\":").append(Boolean.TRUE.equals(l.getRemoved())).append(",")
                        .append("\"sequence\":").append(l.getSequence() != null ? l.getSequence() : i)
                        .append("}");
                if (i < lines.size() - 1) json.append(",");
            }
            json.append("]}");

            QuotationSnapshot snapshot = new QuotationSnapshot();
            snapshot.setQuotationId(saved.getId());
            snapshot.setPayloadJson(json.toString());
            quotationSnapshotRepository.save(snapshot);
        } catch (Exception e) {
            System.err.println("Error creating quotation snapshot: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public QuotationLineDTO editLine(Long lineId, QuotationLineUpdateDTO dto) {
        QuotationLine line = quotationLineRepository.findById(lineId).orElseThrow();
        if (dto.getQuantity() != null) line.setQuantity(dto.getQuantity());
        if (dto.getUnitPrice() != null) line.setUnitPrice(dto.getUnitPrice());
        if (dto.getItemDescription() != null) line.setItemDescription(dto.getItemDescription());
        line.calculateTotal();
        QuotationLine saved = quotationLineRepository.save(line);
        return quotationMapper.toLineDto(saved);
    }

    @Transactional
    public QuotationLineDTO removeLine(Long lineId) {
        QuotationLine line = quotationLineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Quotation line not found"));
        line.markRemoved();
        QuotationLine saved = quotationLineRepository.save(line);
        return quotationMapper.toLineDto(saved);
    }

    @Transactional
    public QuotationLineDTO undoRemoveLine(Long lineId) {
        QuotationLine line = quotationLineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Quotation line not found"));
        line.undoRemoved();
        QuotationLine saved = quotationLineRepository.save(line);
        return quotationMapper.toLineDto(saved);
    }

    @Transactional
    public QuotationDTO linkCatalogsToQuotation(Long quotationId, List<Long> catalogIds) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        List<Catalog> catalogs = catalogRepository.findAllById(catalogIds);
        quotation.setLinkedCatalogs(catalogs);
        Quotation saved = quotationRepository.save(quotation);
        return quotationMapper.toDto(saved);
    }

    public void downloadCatalogsAsZip(Long quotationId, HttpServletResponse response) throws IOException {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        if (quotation.getLinkedCatalogs() == null || quotation.getLinkedCatalogs().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"No catalogs linked to this quotation\"}");
            return;
        }

        String userDir = System.getProperty("user.dir");
        Path uploadBasePath = Paths.get(userDir, "uploads").normalize();
        
        List<File> filesToZip = new ArrayList<>();
        List<String> fileNames = new ArrayList<>();
        
        for (Catalog catalog : quotation.getLinkedCatalogs()) {
            if (catalog.getFilePath() == null || catalog.getFilePath().isEmpty()) {
                continue;
            }
            
            Path filePath = uploadBasePath.resolve(catalog.getFilePath()).normalize();
            File file = filePath.toFile();
            
            if (file.exists() && file.isFile()) {
                filesToZip.add(file);
                fileNames.add(catalog.getFileName() != null ? catalog.getFileName() : file.getName());
            }
        }
        
        if (filesToZip.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"No catalog files found to download\"}");
            return;
        }

        response.setContentType("application/zip");
        response.setHeader("Content-Disposition",
                "attachment; filename=quotation_" + quotationId + "_catalogs.zip");
        
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

    @Transactional
    public QuotationDTO finalizeQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        quotation.setStatus(QuotationStatus.FINALIZED);
        Quotation saved = quotationRepository.save(quotation);

        createQuotationSnapshot(saved);

        return quotationMapper.toDtoWithAllLines(saved);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    @Transactional
    public void deleteQuotation(Long id) {
        quotationRepository.deleteById(id);
    }
}
