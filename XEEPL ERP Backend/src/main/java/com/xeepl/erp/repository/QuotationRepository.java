package com.xeepl.erp.repository;

import com.xeepl.erp.entity.Quotation;
import com.xeepl.erp.entity.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    List<Quotation> findByNameContainingIgnoreCase(String name);
    List<Quotation> findByStatus(QuotationStatus status);
    
    // Fetch quotation with all items (including removed ones) using fetch join
    @Query("SELECT DISTINCT q FROM Quotation q LEFT JOIN FETCH q.items WHERE q.id = :id")
    Optional<Quotation> findByIdWithAllItems(@Param("id") Long id);
    
    // Add more as needed
}
