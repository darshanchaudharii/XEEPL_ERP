package com.xeepl.erp.controller;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.service.QuotationService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotations")
public class QuotationController {
    private final QuotationService service;
    public QuotationController(QuotationService service) { this.service = service; }


    @GetMapping
    public ResponseEntity<List<QuotationDTO>> getAllQuotations() {
        return ResponseEntity.ok(service.listQuotations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuotationDTO> getQuotation(@PathVariable Long id) {
        return ResponseEntity.ok(service.getQuotation(id));
    }

    @PostMapping
    public ResponseEntity<QuotationDTO> create(@Valid @RequestBody QuotationCreateDTO dto) {
        return ResponseEntity.ok(service.createQuotation(dto));
    }
    @PostMapping("/{id}/link-catalogs")
    public ResponseEntity<QuotationDTO> linkCatalogs(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> payload
    ) {
        List<Long> catalogIds = payload.get("catalogIds");
        QuotationDTO updated = service.linkCatalogsToQuotation(id, catalogIds);
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/{id}/catalogs-zip")
    public void downloadCatalogsZip(
            @PathVariable Long id,
            HttpServletResponse response
    ) throws IOException {
        service.downloadCatalogsAsZip(id, response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuotationDTO> update(@PathVariable Long id, @Valid @RequestBody QuotationUpdateDTO dto) {
        return ResponseEntity.ok(service.updateQuotation(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable Long id) {
        service.deleteQuotation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public QuotationDTO get(@PathVariable Long id, @RequestParam(name="includeRemoved", defaultValue="false") boolean includeRemoved) {
        return service.getQuotation(id, includeRemoved);
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<Void> finalize(@PathVariable Long id) {
        service.finalizeQuotation(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/lines/{lineId}")
    public QuotationLineDTO patchLine(@PathVariable Long lineId, @RequestBody Map<String, Object> payload) {
        Integer qty = payload.containsKey("quantity") ? (Integer) payload.get("quantity") : null;
        BigDecimal rate = payload.containsKey("unitPrice") ? new BigDecimal(payload.get("unitPrice").toString()) : null;
        return service.updateLine(lineId, qty, rate);
    }

    @PostMapping("/lines/{lineId}/remove")
    public ResponseEntity<Void> removeLine(@PathVariable Long lineId) {
        service.markLineRemoved(lineId, true);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/lines/{lineId}/undo")
    public ResponseEntity<Void> undoRemoveLine(@PathVariable Long lineId) {
        service.markLineRemoved(lineId, false);
        return ResponseEntity.ok().build();
    }
}
