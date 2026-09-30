package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.ApprovalRequest;
import com.prizmabrixx.crm.domain.entity.LeaveRequest;
import com.prizmabrixx.crm.dto.ApprovalRequestDTO;
import com.prizmabrixx.crm.repository.ApprovalRequestRepository;
import com.prizmabrixx.crm.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalRequestRepository approvalRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public List<ApprovalRequestDTO> getPendingApprovals(Long approverId) {
        return approvalRepository.findByApproverIdAndStatus(approverId, "PENDING").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ApprovalRequestDTO> getAllApprovals(Long approverId) {
        // Just return all for demo purposes, normally you'd fetch by approverId
        return approvalRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApprovalRequestDTO submitDecision(Long id, String status, String responseNote) {
        ApprovalRequest request = approvalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));

        request.setStatus(status);
        request.setResponseNote(responseNote);

        // Auto-update the underlying entity if it's approved or rejected
        if ("APPROVED".equals(status) || "REJECTED".equals(status)) {
            if ("LEAVE_REQUEST".equals(request.getEntityType())) {
                LeaveRequest leaveReq = leaveRequestRepository.findById(request.getEntityId())
                        .orElse(null);
                if (leaveReq != null) {
                    leaveReq.setStatus(status);
                    leaveRequestRepository.save(leaveReq);
                }
            }
            // other types like INVOICE, PROPOSAL can be added here
        }

        return mapToDTO(approvalRepository.save(request));
    }

    private ApprovalRequestDTO mapToDTO(ApprovalRequest request) {
        return ApprovalRequestDTO.builder()
                .id(request.getId())
                .requesterId(request.getRequester() != null ? request.getRequester().getId() : null)
                .requesterName(request.getRequester() != null ? 
                        request.getRequester().getUser().getFirstName() + " " + request.getRequester().getUser().getLastName() : null)
                .approverId(request.getApprover() != null ? request.getApprover().getId() : null)
                .approverName(request.getApprover() != null ? 
                        request.getApprover().getUser().getFirstName() + " " + request.getApprover().getUser().getLastName() : null)
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .status(request.getStatus())
                .requestNote(request.getRequestNote())
                .responseNote(request.getResponseNote())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
