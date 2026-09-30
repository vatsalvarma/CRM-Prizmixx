package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.CreateEmployeeRequest;
import com.prizmabrixx.crm.dto.CreateEmployeeResponse;
import com.prizmabrixx.crm.dto.EmployeeDTO;
import com.prizmabrixx.crm.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/me")
    public ResponseEntity<EmployeeDTO> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(employeeService.getMyProfile(authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN')")
    public ResponseEntity<CreateEmployeeResponse> createEmployee(@RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.ok(employeeService.createEmployee(request));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN')")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.resetPassword(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }
}
