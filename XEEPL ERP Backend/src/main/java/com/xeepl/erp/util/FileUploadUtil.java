package com.xeepl.erp.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class FileUploadUtil {
    // For image-only uploads (Content, User)
    private static final List<String> IMAGE_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png");
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB images

    // For general catalog/document uploads
    private static final List<String> FILE_EXTENSIONS = Arrays.asList(
            ".pdf", ".docx", ".zip", ".xlsx", ".jpg", ".jpeg", ".png"
    );
    private static final List<String> FILE_MIME_TYPES = Arrays.asList(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/zip",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB files

    private static final String UPLOAD_ROOT = "uploads";

    // General safe save: returns subDir/filename for DB reference
    public String saveFile(MultipartFile file, String subDir) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_ROOT, subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String originalFilename = file.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase()
                : "";
        String filename = UUID.randomUUID() + extension;
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return subDir + "/" + filename;
    }

    public void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;
        try {
            Path path = Paths.get(UPLOAD_ROOT, relativePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + relativePath);
        }
    }

    // For images only (used in ContentService, UserService, etc)
    public void validateImageFile(MultipartFile file, long maxSizeBytes) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("No image uploaded.");
        String filename = file.getOriginalFilename();
        String safeName = filename != null ? filename.toLowerCase() : "";
        boolean validExt = IMAGE_EXTENSIONS.stream().anyMatch(safeName::endsWith);
        if (!validExt) throw new IllegalArgumentException("Only JPG and PNG images are allowed.");
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException("Image too large (max allowed: " + (maxSizeBytes / 1024) + " KB).");
        }
    }

    // For catalog/file uploads (used in CatalogService, DocumentService, etc)
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is required for upload.");
        String filename = file.getOriginalFilename();
        String safeName = filename != null ? filename.toLowerCase() : "";
        boolean validExt = FILE_EXTENSIONS.stream().anyMatch(safeName::endsWith);
        boolean validMime = FILE_MIME_TYPES.contains(file.getContentType());
        if (!validExt || !validMime) throw new IllegalArgumentException(
                "Allowed file types: pdf, docx, zip, xlsx, jpg, png"
        );
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File too large. Max size is 10MB.");
        }
    }
}
