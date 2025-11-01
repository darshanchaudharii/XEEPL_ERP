package com.xeepl.erp.repository;

import com.xeepl.erp.entity.Quotation;
import com.xeepl.erp.entity.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    List<Quotation> findByNameContainingIgnoreCase(String name);
    List<Quotation> findByStatus(QuotationStatus status);
    // Add more as needed
}

