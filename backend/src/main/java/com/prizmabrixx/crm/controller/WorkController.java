package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.CreateWorkRequest;
import com.prizmabrixx.crm.dto.WorkDto;
import com.prizmabrixx.crm.service.WorkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/works")
public class WorkController {

    @Autowired
    private WorkService workService;

    @PostMapping
    public ResponseEntity<WorkDto> createWork(@RequestBody CreateWorkRequest request) {
        return ResponseEntity.ok(workService.createWork(request));
    }

    @GetMapping
    public ResponseEntity<List<WorkDto>> getAllWorks() {
        return ResponseEntity.ok(workService.getAllWorks());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<WorkDto>> getWorksByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(workService.getWorksByEmployee(employeeId));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<WorkDto> markAsComplete(@PathVariable Long id) {
        return ResponseEntity.ok(workService.markAsComplete(id));
    }
}
