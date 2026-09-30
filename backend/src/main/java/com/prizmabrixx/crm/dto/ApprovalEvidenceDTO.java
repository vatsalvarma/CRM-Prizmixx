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
public class ApprovalEvidenceDTO {
    private Long id;
    private Long approvalRequestId;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime createdAt;
}
