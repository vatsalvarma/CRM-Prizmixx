package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.domain.entity.Department;
import com.prizmabrixx.crm.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {
    
    private final DepartmentRepository departmentRepository;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SYSTEM_MASTER', 'ADMIN')")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/public")
    public ResponseEntity<List<Department>> getPublicDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }
}
