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
public class ProjectDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private String name;
    private String status;
    private Long managerId;
    private String managerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String title;
    private String description;
    private String referenceLinks;
    private Long assignedDepartmentId;
    private Long assignedEmployeeId;
    private String assignedDepartmentName;
    private String assignedEmployeeName;
    @Builder.Default
    private java.util.List<ProjectAttachmentDTO> attachments = new java.util.ArrayList<>();
    private LocalDateTime createdAt;
}
