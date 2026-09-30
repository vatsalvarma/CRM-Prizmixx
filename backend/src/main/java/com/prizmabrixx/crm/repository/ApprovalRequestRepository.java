package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.ApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {
    List<ApprovalRequest> findByApproverIdAndStatus(Long approverId, String status);
    List<ApprovalRequest> findByRequesterId(Long requesterId);
}
