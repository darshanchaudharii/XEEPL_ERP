package com.xeepl.erp.controller;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.service.QuotationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotations")
@RequiredArgsConstructor
public class QuotationController {
    private final QuotationService quotationService;

    @GetMapping
    public ResponseEntity<List<QuotationDTO>> getAllQuotations() {
        return ResponseEntity.ok(quotationService.listQuotations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuotationDTO> getQuotation(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.getQuotation(id));
    }

    @PostMapping
    public ResponseEntity<QuotationDTO> create(@Valid @RequestBody QuotationCreateDTO dto) {
        return ResponseEntity.ok(quotationService.createQuotation(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuotationDTO> update(@PathVariable Long id, @Valid @RequestBody QuotationUpdateDTO dto) {
        return ResponseEntity.ok(quotationService.updateQuotation(id, dto));
    }

    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        byte[] pdf = quotationService.exportQuotationPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=quotation_" + id + ".pdf")
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(pdf);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable Long id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.noContent().build();
    }
}
