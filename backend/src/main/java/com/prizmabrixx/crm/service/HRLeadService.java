package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Department;
import com.prizmabrixx.crm.domain.entity.HRDocument;
import com.prizmabrixx.crm.domain.entity.HRLead;
import com.prizmabrixx.crm.dto.HRDocumentResponse;
import com.prizmabrixx.crm.dto.HRLeadRequest;
import com.prizmabrixx.crm.dto.HRLeadResponse;
import com.prizmabrixx.crm.repository.DepartmentRepository;
import com.prizmabrixx.crm.repository.HRDocumentRepository;
import com.prizmabrixx.crm.repository.HRLeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HRLeadService {

    private final HRLeadRepository hrLeadRepository;
    private final HRDocumentRepository hrDocumentRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public HRLeadResponse createLead(HRLeadRequest request) {
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
        }

        String status = request.getStatus() != null ? request.getStatus() : "ONBOARDING";
        
        HRLead lead = HRLead.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(department)
                .position(request.getPosition())
                .status(status)
                .build();

        hrLeadRepository.save(lead);

        // Auto-create default documents based on status
        createDefaultDocuments(lead, status);

        return mapToResponse(lead);
    }

    private void createDefaultDocuments(HRLead lead, String status) {
        String[] defaultDocs = "OFFBOARDING".equals(status) 
            ? new String[]{"Resignation Letter", "Equipment Return Checklist", "Exit Interview", "No Dues Clearance"}
            : new String[]{"ID Proof", "Offer Letter", "NDA", "Bank Details"};
            
        for (String docName : defaultDocs) {
            HRDocument doc = HRDocument.builder()
                    .hrLead(lead)
                    .documentName(docName)
                    .documentType(status)
                    .status("PENDING")
                    .build();
            lead.addDocument(doc);
        }
        hrLeadRepository.save(lead);
    }

    @Transactional(readOnly = true)
    public List<HRLeadResponse> getAllLeads() {
        return hrLeadRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HRDocumentResponse updateDocumentStatus(Long documentId, String status) {
        HRDocument document = hrDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        document.setStatus(status);
        hrDocumentRepository.save(document);
        
        return new HRDocumentResponse(
            document.getId(),
            document.getDocumentName(),
            document.getDocumentType(),
            document.getStatus(),
            document.getFileUrl(),
            document.getUpdatedAt()
        );
    }

    private HRLeadResponse mapToResponse(HRLead lead) {
        List<HRDocumentResponse> docs = lead.getDocuments().stream().map(doc -> new HRDocumentResponse(
                doc.getId(),
                doc.getDocumentName(),
                doc.getDocumentType(),
                doc.getStatus(),
                doc.getFileUrl(),
                doc.getUpdatedAt()
        )).collect(Collectors.toList());

        return new HRLeadResponse(
                lead.getId(),
                lead.getFirstName(),
                lead.getLastName(),
                lead.getEmail(),
                lead.getPhone(),
                lead.getDepartment() != null ? lead.getDepartment().getId() : null,
                lead.getDepartment() != null ? lead.getDepartment().getName() : null,
                lead.getPosition(),
                lead.getStatus(),
                docs,
                lead.getCreatedAt(),
                lead.getUpdatedAt()
        );
    }

    @Transactional
    public HRLeadResponse updateLeadStatus(Long leadId, String status) {
        HRLead lead = hrLeadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("HR Lead not found"));
        lead.setStatus(status);
        hrLeadRepository.save(lead);
        return mapToResponse(lead);
    }

    @Transactional
    public HRDocumentResponse uploadDocument(Long documentId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        HRDocument document = hrDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        document.setFileData(file.getBytes());
        document.setFileContentType(file.getContentType());
        document.setStatus("UPLOADED");
        document.setFileUrl("/api/hr/documents/" + documentId + "/preview");
        hrDocumentRepository.save(document);

        return new HRDocumentResponse(
            document.getId(),
            document.getDocumentName(),
            document.getDocumentType(),
            document.getStatus(),
            document.getFileUrl(),
            document.getUpdatedAt()
        );
    }

    @Transactional(readOnly = true)
    public HRDocument getDocument(Long documentId) {
        return hrDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }
}
