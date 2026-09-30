package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.ApprovalEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalEvidenceRepository extends JpaRepository<ApprovalEvidence, Long> {
    List<ApprovalEvidence> findByApprovalRequestIdOrderByCreatedAtAsc(Long approvalRequestId);
}
