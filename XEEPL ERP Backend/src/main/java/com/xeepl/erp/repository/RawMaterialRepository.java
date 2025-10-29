package com.xeepl.erp.repository;

import com.xeepl.erp.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    List<RawMaterial> findByLinkedItem_Id(Long itemId);
    List<RawMaterial> findBySupplier_Id(Long supplierId);
    boolean existsByCode(String code);
}
