package com.xeepl.erp.service;

import com.xeepl.erp.dto.ContentCreateDTO;
import com.xeepl.erp.dto.ContentDTO;
import com.xeepl.erp.dto.ContentUpdateDTO;
import com.xeepl.erp.entity.Content;
import com.xeepl.erp.entity.Section;
import com.xeepl.erp.exception.ResourceNotFoundException;
import com.xeepl.erp.mapper.ContentMapper;
import com.xeepl.erp.repository.ContentRepository;
import com.xeepl.erp.repository.SectionRepository;
import com.xeepl.erp.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {
    private final ContentRepository contentRepository;
    private final SectionRepository sectionRepository;
    private final ContentMapper contentMapper;
    private final FileUploadUtil fileUploadUtil;
    private static final long MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

    public List<ContentDTO> getAllContents() {
        return contentRepository.findAll().stream()
                .map(contentMapper::toDto).collect(Collectors.toList());
    }

    public List<ContentDTO> getContentsBySection(Long sectionId) {
        return contentRepository.findBySection_Id(sectionId).stream()
                .map(contentMapper::toDto).collect(Collectors.toList());
    }

    public ContentDTO getContentById(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
        return contentMapper.toDto(content);
    }

    public ContentDTO createContent(ContentCreateDTO dto, MultipartFile image) throws IOException {
        Section section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + dto.getSectionId()));
        Content content = new Content();
        content.setSection(section);
        content.setTitle(dto.getTitle());
        content.setSequence(dto.getSequence());
        content.setDescription(dto.getDescription());
        content.setAltTag(dto.getAltTag());
        content.setLink(dto.getLink());

        if (image != null && !image.isEmpty()) {
            fileUploadUtil.validateImageFile(image, MAX_IMAGE_SIZE);
            String path = fileUploadUtil.saveFile(image, "content-images");
            content.setImagePath(path); // relative path to file
            content.setImageType(image.getContentType());
            content.setImageSize(image.getSize());
            content.setImageFilename(image.getOriginalFilename());
        }

        return contentMapper.toDto(contentRepository.save(content));
    }
    public ContentDTO updateContent(Long id, ContentUpdateDTO dto, MultipartFile imageFile) throws IOException {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));

        if(dto.getSectionId() != null) {
            Section section = sectionRepository.findById(dto.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + dto.getSectionId()));
            content.setSection(section);
        }
        content.setTitle(dto.getTitle());
        content.setSequence(dto.getSequence());
        content.setDescription(dto.getDescription());
        content.setAltTag(dto.getAltTag());
        content.setLink(dto.getLink());
        content.setImagePath(dto.getImagePath());
        content.setImageType(dto.getImageType());
        content.setImageSize(dto.getImageSize());
        content.setImageFilename(dto.getImageFilename());
        // updatedAt auto-set via @PreUpdate
        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete old file (if exists)
            if (content.getImagePath() != null && !content.getImagePath().isEmpty()) {
                fileUploadUtil.deleteFile(content.getImagePath());
            }
            // Save new image file
            String imagePath = fileUploadUtil.saveFile(imageFile, "content-images");
            content.setImagePath(imagePath);
            content.setImageType(imageFile.getContentType());
            content.setImageSize(imageFile.getSize());
            content.setImageFilename(imageFile.getOriginalFilename());
        } else {
            // Update only metadata from DTO if provided, when no file is uploaded
            if (dto.getImagePath() != null) content.setImagePath(dto.getImagePath());
            if (dto.getImageType() != null) content.setImageType(dto.getImageType());
            if (dto.getImageSize() != null) content.setImageSize(dto.getImageSize());
            if (dto.getImageFilename() != null) content.setImageFilename(dto.getImageFilename());
        }

        Content updated = contentRepository.save(content);
        return contentMapper.toDto(updated);
    }

    public void deleteContent(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
        if (content.getImagePath() != null) {
            fileUploadUtil.deleteFile(content.getImagePath());
        }
        contentRepository.delete(content);
    }
}
