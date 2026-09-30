package com.prizmabrixx.crm.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hr_leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HRLead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column
    private String position;

    @Column(nullable = false)
    private String status = "ONBOARDING"; // ONBOARDING, OFFBOARDING, COMPLETED, REJECTED

    @OneToMany(mappedBy = "hrLead", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HRDocument> documents = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void addDocument(HRDocument document) {
        documents.add(document);
        document.setHrLead(this);
    }
}
