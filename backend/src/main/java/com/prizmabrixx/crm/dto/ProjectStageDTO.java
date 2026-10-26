package com.prizmabrixx.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStageDTO {
    private Long id;
    private Long projectId;
    private String stageName; // DESIGN, RESOURCES, DEVELOP_TEST, DEPLOY
    private Integer stageOrder;
    private String status; // PENDING, IN_PROGRESS, COMPLETED
    private String title;
    private String description;
    private String referenceLinks;
    private String submissionLink;
    private String submissionNotes;
    private Long submittedById;
    private String submittedByName;
    private LocalDateTime completedAt;
    @Builder.Default
    private List<EmployeeDTO> assignees = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
