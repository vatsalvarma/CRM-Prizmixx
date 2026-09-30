package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.HRDocumentResponse;
import com.prizmabrixx.crm.dto.HRLeadRequest;
import com.prizmabrixx.crm.dto.HRLeadResponse;
import com.prizmabrixx.crm.service.HRLeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
public class HRLeadController {

    private final HRLeadService hrLeadService;

    @PostMapping("/leads")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<HRLeadResponse> createLead(@RequestBody HRLeadRequest request) {
        return ResponseEntity.ok(hrLeadService.createLead(request));
    }

    @GetMapping("/leads")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<HRLeadResponse>> getAllLeads() {
        return ResponseEntity.ok(hrLeadService.getAllLeads());
    }

    @PutMapping("/documents/{documentId}/status")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<HRDocumentResponse> updateDocumentStatus(
            @PathVariable Long documentId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(hrLeadService.updateDocumentStatus(documentId, body.get("status")));
    }

    @PutMapping("/leads/{id}/status")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<HRLeadResponse> updateLeadStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(hrLeadService.updateLeadStatus(id, body.get("status")));
    }

    @PostMapping("/documents/{documentId}/upload")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN', 'EMPLOYEE')")
    public ResponseEntity<HRDocumentResponse> uploadDocument(
            @PathVariable Long documentId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(hrLeadService.uploadDocument(documentId, file));
    }

    @GetMapping("/documents/{documentId}/preview")
    public ResponseEntity<byte[]> previewDocument(@PathVariable Long documentId) {
        com.prizmabrixx.crm.domain.entity.HRDocument document = hrLeadService.getDocument(documentId);
        if (document.getFileData() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, document.getFileContentType())
                .body(document.getFileData());
    }
}
