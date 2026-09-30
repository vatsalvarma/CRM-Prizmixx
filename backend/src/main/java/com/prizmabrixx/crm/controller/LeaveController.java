package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.LeaveBalanceDTO;
import com.prizmabrixx.crm.dto.LeaveRequestDTO;
import com.prizmabrixx.crm.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping("/balances")
    public ResponseEntity<List<LeaveBalanceDTO>> getMyBalances(Authentication authentication) {
        return ResponseEntity.ok(leaveService.getMyBalances(authentication.getName()));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<LeaveRequestDTO>> getMyRequests(Authentication authentication) {
        return ResponseEntity.ok(leaveService.getMyRequests(authentication.getName()));
    }

    @GetMapping("/all-requests")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveRequestDTO>> getAllRequests() {
        return ResponseEntity.ok(leaveService.getAllPendingRequests());
    }
    
    @GetMapping("/test-all")
    public ResponseEntity<List<LeaveRequestDTO>> getTestAllRequests() {
        return ResponseEntity.ok(leaveService.getAllPendingRequests());
    }

    @PostMapping("/request")
    public ResponseEntity<LeaveRequestDTO> submitLeaveRequest(@Valid @RequestBody LeaveRequestDTO dto, Authentication authentication) {
        return ResponseEntity.ok(leaveService.submitLeaveRequest(authentication.getName(), dto));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDTO> approveRequest(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(leaveService.approveRequest(authentication.getName(), id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDTO> rejectRequest(@PathVariable Long id, @RequestBody LeaveRequestDTO dto, Authentication authentication) {
        return ResponseEntity.ok(leaveService.rejectRequest(authentication.getName(), id, dto.getRejectionReason()));
    }
}
