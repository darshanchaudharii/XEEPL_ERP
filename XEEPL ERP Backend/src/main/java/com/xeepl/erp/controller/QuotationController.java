package com.xeepl.erp.controller;

import com.xeepl.erp.dto.*;
import com.xeepl.erp.service.QuotationService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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
    @PostMapping("/{id}/link-catalogs")
    public ResponseEntity<QuotationDTO> linkCatalogs(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> payload
    ) {
        List<Long> catalogIds = payload.get("catalogIds");
        QuotationDTO updated = quotationService.linkCatalogsToQuotation(id, catalogIds);
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/{id}/catalogs-zip")
    public void downloadCatalogsZip(
            @PathVariable Long id,
            HttpServletResponse response
    ) throws IOException {
        quotationService.downloadCatalogsAsZip(id, response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuotationDTO> update(@PathVariable Long id, @Valid @RequestBody QuotationUpdateDTO dto) {
        return ResponseEntity.ok(quotationService.updateQuotation(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable Long id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.noContent().build();
    }
}
