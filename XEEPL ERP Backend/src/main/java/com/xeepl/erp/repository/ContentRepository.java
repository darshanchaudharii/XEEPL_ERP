package com.xeepl.erp.repository;

import com.xeepl.erp.entity.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
    List<Content> findBySection_Id(Long sectionId);
}
