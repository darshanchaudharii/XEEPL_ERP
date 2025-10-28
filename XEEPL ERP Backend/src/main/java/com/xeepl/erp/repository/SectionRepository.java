package com.xeepl.erp.repository;

import com.xeepl.erp.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    Optional<Section> findBySectionName(String sectionName);
    boolean existsBySectionName(String sectionName);
}
