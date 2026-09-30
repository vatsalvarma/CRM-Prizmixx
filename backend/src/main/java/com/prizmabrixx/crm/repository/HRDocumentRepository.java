package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.HRDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HRDocumentRepository extends JpaRepository<HRDocument, Long> {
    List<HRDocument> findByHrLeadId(Long hrLeadId);
}
