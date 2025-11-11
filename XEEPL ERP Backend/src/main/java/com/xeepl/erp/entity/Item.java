package com.xeepl.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "items")
@Data
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_category_id")
    private Content itemCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_subcategory_id")
    private Content itemSubcategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private User supplier;

    @Column(name = "item_qty")
    private Double itemQty;

    @Column(name = "item_price")
    private Double itemPrice;

    @Column(name = "item_code", unique = true)
    private String itemCode;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "parentItem", fetch = FetchType.LAZY)
    private List<RawMaterial> rawMaterials;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
