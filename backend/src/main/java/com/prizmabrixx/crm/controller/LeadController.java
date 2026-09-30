package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.LeadActivityDTO;
import com.prizmabrixx.crm.dto.LeadDTO;
import com.prizmabrixx.crm.service.LeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @GetMapping
    public ResponseEntity<List<LeadDTO>> getLeads() {
        return ResponseEntity.ok(leadService.getAllLeads());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeadDTO> getLead(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.getLeadById(id));
    }

    @PostMapping
    public ResponseEntity<LeadDTO> createLead(@RequestBody LeadDTO leadDTO, Authentication authentication) {
        return ResponseEntity.ok(leadService.createLead(leadDTO, authentication.getName()));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<LeadDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        String newStatus = body.get("status");
        return ResponseEntity.ok(leadService.updateLeadStatus(id, newStatus, authentication.getName()));
    }
    
    @GetMapping("/{id}/activities")
    public ResponseEntity<List<LeadActivityDTO>> getActivities(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.getLeadActivities(id));
    }
    
    @PostMapping("/{id}/activities")
    public ResponseEntity<LeadActivityDTO> addActivity(@PathVariable Long id, @RequestBody LeadActivityDTO activityDTO, Authentication authentication) {
        return ResponseEntity.ok(leadService.addActivity(id, activityDTO, authentication.getName()));
    }
}
