package com.xeepl.erp.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Component
public class FileUploadUtil {
    private static final String UPLOAD_ROOT = "uploads";

    public String saveFile(MultipartFile file, String subDir) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_ROOT, subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String originalFilename = file.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = UUID.randomUUID() + extension;
        Path filePath = uploadPath.resolve(filename);

        System.out.println("Saving file to: " + filePath.toAbsolutePath());
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return subDir + "/" + filename; // Return relative path for DB storage
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

    public void validateImageFile(MultipartFile file, long maxSizeBytes) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("No file uploaded.");
        String filename = file.getOriginalFilename();
        if (filename != null && !(filename.endsWith(".jpg") || filename.endsWith(".jpeg") || filename.endsWith(".png"))) {
            throw new IllegalArgumentException("Only JPG and PNG images are allowed.");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException("File too large (max allowed: " + (maxSizeBytes / 1024) + " KB).");
        }
    }
}
