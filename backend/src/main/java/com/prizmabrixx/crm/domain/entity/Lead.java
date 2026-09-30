package com.prizmabrixx.crm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_company", nullable = false, length = 100)
    private String clientCompany;

    @Column(name = "contact_name", nullable = false, length = 100)
    private String contactName;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 50)
    private String source;

    @Column(name = "required_service", length = 100)
    private String requiredService;

    @Column(name = "commercial_range", length = 50)
    private String commercialRange;

    @Column(name = "expected_decision")
    private LocalDate expectedDecision;

    @Column(nullable = false, length = 50)
    private String status; // NEW, QUALIFIED, PROPOSAL_SENT, LOST, CONVERTED

    @Column(name = "lost_reason", length = 255)
    private String lostReason;

    @Column(name = "project_name", length = 100)
    private String projectName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reference_links", columnDefinition = "TEXT")
    private String referenceLinks;

    @Column(name = "document_url", length = 255)
    private String documentUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Employee owner;

    @Column(name = "next_action", length = 255)
    private String nextAction;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
