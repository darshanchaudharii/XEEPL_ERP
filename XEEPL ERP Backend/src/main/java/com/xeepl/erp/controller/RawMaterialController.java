package com.xeepl.erp.controller;

import com.xeepl.erp.dto.RawMaterialCreateDTO;
import com.xeepl.erp.dto.RawMaterialDTO;
import com.xeepl.erp.dto.RawMaterialUpdateDTO;
import com.xeepl.erp.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raw-materials")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    @GetMapping
    public ResponseEntity<List<RawMaterialDTO>> getAllRawMaterials(
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Long supplierId
    ) {
        if (itemId != null) {
            return ResponseEntity.ok(rawMaterialService.getByLinkedItem(itemId));
        }
        if (supplierId != null) {
            return ResponseEntity.ok(rawMaterialService.getBySupplier(supplierId));
        }
        return ResponseEntity.ok(rawMaterialService.getAllRawMaterials());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterialDTO> getRawMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(rawMaterialService.getRawMaterialById(id));
    }

    @PostMapping
    public ResponseEntity<RawMaterialDTO> createRawMaterial(@RequestBody RawMaterialCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rawMaterialService.createRawMaterial(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RawMaterialDTO> updateRawMaterial(
            @PathVariable Long id,
            @RequestBody RawMaterialUpdateDTO dto
    ) {
        return ResponseEntity.ok(rawMaterialService.updateRawMaterial(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRawMaterial(@PathVariable Long id) {
        rawMaterialService.deleteRawMaterial(id);
        return ResponseEntity.noContent().build();
    }
}
