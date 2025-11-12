package com.xeepl.erp.controller;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.service.QuotationService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
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
    public ResponseEntity<QuotationDTO> getQuotation(
            @PathVariable Long id,
            @RequestParam(name = "includeRemoved", defaultValue = "false") boolean includeRemoved
    ) {
        return ResponseEntity.ok(service.getQuotation(id, includeRemoved));
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

    // Edit single line
    @PatchMapping("/lines/{lineId}")
    public ResponseEntity<QuotationLineDTO> editLine(
            @PathVariable Long lineId,
            @Valid @RequestBody QuotationLineUpdateDTO dto
    ) {
        return ResponseEntity.ok(service.editLine(lineId, dto));
    }

    // Soft delete a quotation line
    @PatchMapping("/lines/{lineId}/remove")
    public ResponseEntity<QuotationLineDTO> removeLine(@PathVariable Long lineId) {
        return ResponseEntity.ok(service.removeLine(lineId));
    }

    // Restore a removed quotation line
    @PatchMapping("/lines/{lineId}/undo")
    public ResponseEntity<QuotationLineDTO> undoRemoveLine(@PathVariable Long lineId) {
        return ResponseEntity.ok(service.undoRemoveLine(lineId));
    }

    // Finalize quotation and snapshot
    @PostMapping("/{id}/finalize")
    public ResponseEntity<QuotationDTO> finalizeQuotation(@PathVariable Long id) {
        return ResponseEntity.ok(service.finalizeQuotation(id));
    }

    // Export PDF stub (return 204 here; wire actual PDF generation later)
    @GetMapping("/{id}/export-pdf")
    public void exportPdf(@PathVariable Long id, HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=quotation_" + id + ".pdf");
        // minimal stub: empty PDF bytes or message. For now write nothing to keep stub simple.
        response.getOutputStream().flush();
    }
}
