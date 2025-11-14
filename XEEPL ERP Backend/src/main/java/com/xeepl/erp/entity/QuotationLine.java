package com.xeepl.erp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a single line in a quotation.
 * This can be a main item line or a raw-material line (linked to a parent item).
 */
@Entity
@Table(name = "quotation_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @Column(name = "item_description", nullable = false)
    private String itemDescription;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "total", precision = 14, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "is_raw_material", nullable = false)
    private Boolean isRawMaterial = false;

  @Column(name = "parent_item_id")
    private Long parentItemId;

    @Column(name = "raw_id")
    private Long rawId;

    @Column(name = "removed", nullable = false)
    private Boolean removed = false;

    @Column(name = "sequence", nullable = false)
    private Integer sequence = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



    public void calculateTotal() {
        if (quantity == null) quantity = 0;
        if (unitPrice == null) unitPrice = BigDecimal.ZERO;
        this.total = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public void markRemoved() {
        this.removed = true;
    }

    public void undoRemoved() {
        this.removed = false;
    }
}
