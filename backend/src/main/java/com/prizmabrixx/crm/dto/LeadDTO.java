package com.prizmabrixx.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadDTO {
    private Long id;
    private String clientCompany;
    private String contactName;
    private String phone;
    private String email;
    private String source;
    private String requiredService;
    private String commercialRange;
    private LocalDate expectedDecision;
    private String status;
    private String lostReason;
    private Long ownerId;
    private String ownerName;
    private String ownerDepartment;
    private String projectName;
    private String description;
    private String referenceLinks;
    private String documentUrl;
    private String nextAction;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
