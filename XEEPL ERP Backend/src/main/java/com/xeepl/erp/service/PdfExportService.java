package com.xeepl.erp.service;

import com.itextpdf.layout.properties.UnitValue;
import com.xeepl.erp.entity.Catalog;
import com.xeepl.erp.entity.Quotation;
import com.xeepl.erp.entity.QuotationLine;
import com.xeepl.erp.entity.User;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.WriterProperties;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.math.BigDecimal;

@Service
public class PdfExportService {

    /**
     * Export the given quotation to compressed PDF.
     * Only includes customer name if present; never exports status.
     */
    public byte[] exportQuotationPdf(Quotation quotation) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            WriterProperties writerProps = new WriterProperties();
            writerProps.setCompressionLevel(9); // Maximum compression

            PdfWriter writer = new PdfWriter(baos, writerProps);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document doc = new Document(pdfDoc);

            // Header
            doc.add(new Paragraph("Quotation ID: " + quotation.getId()).setBold());
            doc.add(new Paragraph("Quotation Name: " + quotation.getName()));
            doc.add(new Paragraph("Date: " + quotation.getDate()));
            doc.add(new Paragraph("Expiry Date: " + quotation.getExpiryDate()));

            // Customer name: Only if assigned
            User customer = quotation.getCustomer();
            if (customer != null && customer.getFullName() != null && !customer.getFullName().isEmpty()) {
                doc.add(new Paragraph("Customer: " + customer.getFullName()));
            }

            // Catalog Section
            if (quotation.getLinkedCatalogs() != null && !quotation.getLinkedCatalogs().isEmpty()) {
                doc.add(new Paragraph("Linked Catalogs:").setBold());
                for (Catalog cat : quotation.getLinkedCatalogs()) {
                    doc.add(new Paragraph("- " + cat.getTitle()));
                    doc.add(new Paragraph(cat.getDescription()));
                    // Add logo if present (compressed)
                    if (cat.getFilePath() != null && !cat.getFilePath().isEmpty()) {
                        Image img = toCompressedImage(cat.getFilePath(), 128, 128);
                        if (img != null) doc.add(img);
                    }
                }
            }

            // Quotation Lines Table
            doc.add(new Paragraph("Quotation Lines:").setBold());
            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 5, 2, 2, 2}));
            table.addHeaderCell("Sr No");
            table.addHeaderCell("Description");
            table.addHeaderCell("Qty");
            table.addHeaderCell("Rate");
            table.addHeaderCell("Total");
            int idx = 1;
            BigDecimal grandTotal = BigDecimal.ZERO;
            for (QuotationLine line : quotation.getItems()) {
                table.addCell(String.valueOf(idx++));
                table.addCell(line.getItemDescription());
                table.addCell(String.valueOf(line.getQuantity()));
                table.addCell(line.getUnitPrice().toPlainString());
                table.addCell(line.getTotal().toPlainString());
                grandTotal = grandTotal.add(line.getTotal());
            }
            table.addCell("");
            table.addCell("Grand Total");
            table.addCell("");
            table.addCell("");
            table.addCell(grandTotal.toPlainString());
            doc.add(table);

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            // Log error and return empty PDF
            return new byte[0];
        }
    }

    /**
     * Loads image from disk, compresses/scales it, and returns iText Image.
     */
    private Image toCompressedImage(String path, int width, int height) {
        try {
            BufferedImage img = ImageIO.read(new File(path));
            BufferedImage scaled = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = scaled.createGraphics();
            g.setComposite(AlphaComposite.Src);
            g.drawImage(img, 0, 0, width, height, null);
            g.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(scaled, "jpg", baos);
            ImageData imageData = ImageDataFactory.create(baos.toByteArray());
            return new Image(imageData);
        } catch (Exception e) {
            // Image not found or error
            return null;
        }
    }
}
