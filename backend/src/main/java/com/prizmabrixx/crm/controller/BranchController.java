package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.BranchDTO;
import com.prizmabrixx.crm.dto.CreateBranchRequest;
import com.prizmabrixx.crm.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    // Public endpoint — used on login page branch dropdown
    @GetMapping("/public")
    public ResponseEntity<List<BranchDTO>> getActiveBranches() {
        return ResponseEntity.ok(branchService.getActiveBranches());
    }

    // Admin: get all branches (including inactive)
    @GetMapping
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN')")
    public ResponseEntity<List<BranchDTO>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN')")
    public ResponseEntity<BranchDTO> createBranch(@RequestBody CreateBranchRequest request) {
        return ResponseEntity.ok(branchService.createBranch(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN')")
    public ResponseEntity<BranchDTO> updateBranch(@PathVariable Long id, @RequestBody CreateBranchRequest request) {
        return ResponseEntity.ok(branchService.updateBranch(id, request));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN')")
    public ResponseEntity<Void> toggleBranchStatus(@PathVariable Long id) {
        branchService.toggleBranchStatus(id);
        return ResponseEntity.ok().build();
    }
}
