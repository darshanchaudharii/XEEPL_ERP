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

    // Allowed image extensions and MIME types
    private static final List<String> IMAGE_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png");
    private static final List<String> IMAGE_MIME_TYPES = Arrays.asList("image/jpeg", "image/png");

    // Allowed file extensions and MIME types for documents/catalogs
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

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB images
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB files
    private static final String UPLOAD_ROOT = "uploads";

    /**
     * Save file to disk, assign random UUID as name, return subDir/filename as relative DB path.
     */
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
        return subDir + "/" + filename; // DB stores e.g. profiles/uuid.png
    }

    /**
     * Delete relative file path under uploads root.
     */
    public void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;
        try {
            Path path = Paths.get(UPLOAD_ROOT, relativePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + relativePath);
        }
    }

    /**
     * Validate that the uploaded file is an image of allowed type/size.
     */
    public void validateImageFile(MultipartFile file, long maxSizeBytes) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("No image uploaded.");
        String filename = file.getOriginalFilename();
        String safeName = filename != null ? filename.toLowerCase() : "";
        boolean validExt = IMAGE_EXTENSIONS.stream().anyMatch(safeName::endsWith);
        boolean validMime = IMAGE_MIME_TYPES.contains(file.getContentType());
        if (!validExt || !validMime)
            throw new IllegalArgumentException("Only JPG and PNG image files are allowed.");
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException("Image too large. Max allowed: " + (maxSizeBytes / 1024) + " KB.");
        }
    }

    /**
     * Validate that the uploaded file is a permitted document/image for catalogs etc.
     */
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is required for upload.");
        String filename = file.getOriginalFilename();
        String safeName = filename != null ? filename.toLowerCase() : "";
        boolean validExt = FILE_EXTENSIONS.stream().anyMatch(safeName::endsWith);
        boolean validMime = FILE_MIME_TYPES.contains(file.getContentType());
        if (!validExt || !validMime)
            throw new IllegalArgumentException(
                    "Allowed file types: pdf, docx, zip, xlsx, jpg, png"
            );
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File too large. Max allowed: " + (MAX_FILE_SIZE / (1024*1024)) + " MB.");
        }
    }
}
