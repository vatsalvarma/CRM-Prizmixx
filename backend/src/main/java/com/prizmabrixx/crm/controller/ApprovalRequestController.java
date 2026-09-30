package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.ApprovalRequestDTO;
import com.prizmabrixx.crm.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalRequestController {

    private final ApprovalService approvalService;

    @GetMapping("/pending/{approverId}")
    public ResponseEntity<List<ApprovalRequestDTO>> getPendingApprovals(@PathVariable Long approverId) {
        return ResponseEntity.ok(approvalService.getPendingApprovals(approverId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ApprovalRequestDTO>> getAllApprovals() {
        // Just return all for demo
        return ResponseEntity.ok(approvalService.getAllApprovals(1L));
    }

    @PostMapping("/{id}/decision")
    public ResponseEntity<ApprovalRequestDTO> submitDecision(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body) {
        
        String status = body.get("status");
        String responseNote = body.get("responseNote");
        
        return ResponseEntity.ok(approvalService.submitDecision(id, status, responseNote));
    }
}
