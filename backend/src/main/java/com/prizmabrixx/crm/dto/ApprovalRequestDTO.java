package com.prizmabrixx.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequestDTO {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private Long approverId;
    private String approverName;
    private String entityType;
    private Long entityId;
    private String status;
    private String requestNote;
    private String responseNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
