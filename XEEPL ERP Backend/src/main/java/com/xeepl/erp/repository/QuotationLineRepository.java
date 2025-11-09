package com.xeepl.erp.repository;

import com.xeepl.erp.entity.QuotationLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationLineRepository extends JpaRepository<QuotationLine, Long> {
    List<QuotationLine> findByQuotationIdOrderById(Long quotationId);
    List<QuotationLine> findByQuotationIdAndIsRawMaterialFalseOrderById(Long quotationId);
    List<QuotationLine> findByParentItemIdOrderById(Long parentId);
}

