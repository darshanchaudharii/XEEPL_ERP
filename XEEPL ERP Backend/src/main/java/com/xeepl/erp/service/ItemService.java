package com.xeepl.erp.service;

import com.xeepl.erp.dto.ItemCreateDTO;
import com.xeepl.erp.dto.ItemDTO;
import com.xeepl.erp.dto.ItemUpdateDTO;
import com.xeepl.erp.entity.Content;
import com.xeepl.erp.entity.Item;
import com.xeepl.erp.entity.User;
import com.xeepl.erp.exception.ResourceNotFoundException;
import com.xeepl.erp.mapper.ItemMapper;
import com.xeepl.erp.repository.ContentRepository;
import com.xeepl.erp.repository.ItemRepository;
import com.xeepl.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {
    private final ItemRepository itemRepository;
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final ItemMapper itemMapper;

    public List<ItemDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(itemMapper::toDto).collect(Collectors.toList());
    }

    public ItemDTO getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        return itemMapper.toDto(item);
    }

    public ItemDTO createItem(ItemCreateDTO dto) {
        if (itemRepository.existsByItemCode(dto.getItemCode())) {
            throw new IllegalArgumentException("Item code already exists.");
        }
        Item item = new Item();
        item.setItemName(dto.getItemName());
        if (dto.getItemCategoryId() != null) {
            Content category = contentRepository.findById(dto.getItemCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            item.setItemCategory(category);
        }
        if (dto.getItemSubcategoryId() != null) {
            Content subcategory = contentRepository.findById(dto.getItemSubcategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found"));
            item.setItemSubcategory(subcategory);
        }
        if (dto.getSupplierId() != null) {
            User supplier = userRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            item.setSupplier(supplier);
        }
        item.setItemQty(dto.getItemQty());
        item.setItemPrice(dto.getItemPrice());
        item.setItemCode(dto.getItemCode());
        item.setDescription(dto.getDescription());
        return itemMapper.toDto(itemRepository.save(item));
    }

    public ItemDTO updateItem(Long id, ItemUpdateDTO dto) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        if (dto.getItemName() != null) item.setItemName(dto.getItemName());
        if (dto.getItemCategoryId() != null) {
            Content category = contentRepository.findById(dto.getItemCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            item.setItemCategory(category);
        }
        if (dto.getItemSubcategoryId() != null) {
            Content subcategory = contentRepository.findById(dto.getItemSubcategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found"));
            item.setItemSubcategory(subcategory);
        }
        if (dto.getSupplierId() != null) {
            User supplier = userRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            item.setSupplier(supplier);
        }
        if (dto.getItemQty() != null) item.setItemQty(dto.getItemQty());
        if (dto.getItemPrice() != null) item.setItemPrice(dto.getItemPrice());
        if (dto.getItemCode() != null) item.setItemCode(dto.getItemCode());
        if (dto.getDescription() != null) item.setDescription(dto.getDescription());
        return itemMapper.toDto(itemRepository.save(item));
    }

    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        itemRepository.delete(item);
    }
}
