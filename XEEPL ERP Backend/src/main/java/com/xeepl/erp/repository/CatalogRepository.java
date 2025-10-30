package com.xeepl.erp.repository;

import com.xeepl.erp.entity.Catalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogRepository extends JpaRepository<Catalog, Long> {
    List<Catalog> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
}
