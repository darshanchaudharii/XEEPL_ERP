package com.xeepl.erp.service;

import com.xeepl.erp.dto.RawMaterialCreateDTO;
import com.xeepl.erp.dto.RawMaterialDTO;
import com.xeepl.erp.dto.RawMaterialUpdateDTO;
import com.xeepl.erp.entity.Item;
import com.xeepl.erp.entity.RawMaterial;
import com.xeepl.erp.entity.User;
import com.xeepl.erp.exception.ResourceNotFoundException;
import com.xeepl.erp.mapper.RawMaterialMapper;
import com.xeepl.erp.repository.ItemRepository;
import com.xeepl.erp.repository.RawMaterialRepository;
import com.xeepl.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RawMaterialService {
    private final RawMaterialRepository rawMaterialRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final RawMaterialMapper rawMaterialMapper;

    public List<RawMaterialDTO> getAllRawMaterials() {
        return rawMaterialRepository.findAll().stream()
                .map(rawMaterialMapper::toDto).collect(Collectors.toList());
    }

    public List<RawMaterialDTO> getByLinkedItem(Long itemId) {
        return rawMaterialRepository.findByLinkedItem_Id(itemId)
                .stream().map(rawMaterialMapper::toDto).collect(Collectors.toList());
    }

    public List<RawMaterialDTO> getBySupplier(Long supplierId) {
        return rawMaterialRepository.findBySupplier_Id(supplierId)
                .stream().map(rawMaterialMapper::toDto).collect(Collectors.toList());
    }

    public RawMaterialDTO getRawMaterialById(Long id) {
        RawMaterial r = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw material not found"));
        return rawMaterialMapper.toDto(r);
    }

    public RawMaterialDTO createRawMaterial(RawMaterialCreateDTO dto) {
        if (rawMaterialRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Code already exists");
        }
        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.setName(dto.getName());
        rawMaterial.setQuantity(dto.getQuantity());
        rawMaterial.setPrice(dto.getPrice());
        rawMaterial.setCode(dto.getCode());
        if (dto.getLinkedItemId() != null) {
            Item item = itemRepository.findById(dto.getLinkedItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Linked item not found"));
            rawMaterial.setLinkedItem(item);
        }
        if (dto.getSupplierId() != null) {
            User supplier = userRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            rawMaterial.setSupplier(supplier);
        }
        rawMaterial.setAddInQuotation(dto.getAddInQuotation() != null ? dto.getAddInQuotation() : false);
        rawMaterial.setDescription(dto.getDescription());
        return rawMaterialMapper.toDto(rawMaterialRepository.save(rawMaterial));
    }

    public RawMaterialDTO updateRawMaterial(Long id, RawMaterialUpdateDTO dto) {
        RawMaterial rawMaterial = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw material not found"));
        if (dto.getName() != null) rawMaterial.setName(dto.getName());
        if (dto.getQuantity() != null) rawMaterial.setQuantity(dto.getQuantity());
        if (dto.getPrice() != null) rawMaterial.setPrice(dto.getPrice());
        if (dto.getCode() != null) rawMaterial.setCode(dto.getCode());
        if (dto.getLinkedItemId() != null) {
            Item item = itemRepository.findById(dto.getLinkedItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Linked item not found"));
            rawMaterial.setLinkedItem(item);
        }
        if (dto.getSupplierId() != null) {
            User supplier = userRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            rawMaterial.setSupplier(supplier);
        }
        if (dto.getAddInQuotation() != null) rawMaterial.setAddInQuotation(dto.getAddInQuotation());
        if (dto.getDescription() != null) rawMaterial.setDescription(dto.getDescription());
        return rawMaterialMapper.toDto(rawMaterialRepository.save(rawMaterial));
    }

    public void deleteRawMaterial(Long id) {
        RawMaterial r = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw material not found"));
        rawMaterialRepository.delete(r);
    }
}
