package com.xeepl.erp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
@Entity
@Table(name = "quotation_lines")
@Data
public class QuotationLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemDescription;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private BigDecimal total;

    @ManyToOne
    @JoinColumn(name = "quotation_id")
    private Quotation quotation;

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        total = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
