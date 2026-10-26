package com.prizmabrixx.crm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "stage_name", nullable = false, length = 50)
    private String stageName; // DESIGN, RESOURCES, DEVELOP_TEST, DEPLOY

    @Column(name = "stage_order", nullable = false)
    private Integer stageOrder;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reference_links", columnDefinition = "TEXT")
    private String referenceLinks;

    @Column(name = "submission_link", columnDefinition = "TEXT")
    private String submissionLink;

    @Column(name = "submission_notes", columnDefinition = "TEXT")
    private String submissionNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_id")
    private Employee submittedBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "project_stage_assignees",
        joinColumns = @JoinColumn(name = "stage_id"),
        inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    @Builder.Default
    private List<Employee> assignees = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
