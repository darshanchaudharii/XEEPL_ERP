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

    /** The parent quotation this line belongs to */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    /** Description of the item or raw material */
    @Column(name = "item_description", nullable = false)
    private String itemDescription;

    /** Quantity for this line */
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    /** Unit price for this line */
    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    /** Calculated total = quantity × unit price */
    @Column(name = "total", precision = 14, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    // ---------------------------------------------------------------------
    //  Raw-material relationship fields (new)
    // ---------------------------------------------------------------------

    /** true if this line is a raw material linked to another item */
    @Column(name = "is_raw_material", nullable = false)
    private Boolean isRawMaterial = false;

    /** the parent item line ID this raw material belongs to (null for main items) */
    @Column(name = "parent_item_id")
    private Long parentItemId;

    /** optional ID reference to the raw material master record */
    @Column(name = "raw_id")
    private Long rawId;

    /** soft-delete flag: true if this line was removed */
    @Column(name = "removed", nullable = false)
    private Boolean removed = false;

    // ---------------------------------------------------------------------
    //  Audit fields
    // ---------------------------------------------------------------------

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ---------------------------------------------------------------------
    //  Utility methods
    // ---------------------------------------------------------------------

    /**
     * Calculates and updates total = quantity × unitPrice.
     * Should be called before saving.
     */
    public void calculateTotal() {
        if (quantity == null) quantity = 0;
        if (unitPrice == null) unitPrice = BigDecimal.ZERO;
        this.total = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    /**
     * Marks the line as removed (soft delete).
     */
    public void markRemoved() {
        this.removed = true;
    }

    /**
     * Restores a previously removed line.
     */
    public void undoRemoved() {
        this.removed = false;
    }
}
