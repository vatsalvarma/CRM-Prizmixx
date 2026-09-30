package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Department;
import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.domain.entity.Work;
import com.prizmabrixx.crm.dto.CreateWorkRequest;
import com.prizmabrixx.crm.dto.WorkDto;
import com.prizmabrixx.crm.repository.DepartmentRepository;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import com.prizmabrixx.crm.repository.WorkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkService {

    @Autowired
    private WorkRepository workRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public WorkDto createWork(CreateWorkRequest request) {
        Work work = new Work();
        work.setName(request.getName());
        work.setDescription(request.getDescription());
        work.setReferenceLinks(request.getReferenceLinks());
        work.setDocumentPdf(request.getDocumentPdf());
        
        Department dept = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new RuntimeException("Department not found"));
        work.setDepartment(dept);
        
        Employee emp = employeeRepository.findById(request.getAssignedEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        work.setAssignedEmployee(emp);
        
        work.setAssignedDate(LocalDateTime.now());
        work.setCompleted(false);

        work = workRepository.save(work);
        
        WorkDto dto = mapToDto(work);
        messagingTemplate.convertAndSend("/topic/works", dto);
        return dto;
    }

    public List<WorkDto> getAllWorks() {
        return workRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<WorkDto> getWorksByEmployee(Long employeeId) {
        return workRepository.findByAssignedEmployeeId(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkDto markAsComplete(Long id) {
        Work work = workRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Work not found"));
        work.setCompleted(true);
        work = workRepository.save(work);
        
        WorkDto dto = mapToDto(work);
        messagingTemplate.convertAndSend("/topic/works", dto);
        return dto;
    }

    private WorkDto mapToDto(Work work) {
        WorkDto dto = new WorkDto();
        dto.setId(work.getId());
        dto.setName(work.getName());
        dto.setDescription(work.getDescription());
        dto.setReferenceLinks(work.getReferenceLinks());
        dto.setDocumentPdf(work.getDocumentPdf());
        if (work.getDepartment() != null) {
            dto.setDepartmentId(work.getDepartment().getId());
            dto.setDepartmentName(work.getDepartment().getName());
        }
        if (work.getAssignedEmployee() != null && work.getAssignedEmployee().getUser() != null) {
            dto.setAssignedEmployeeId(work.getAssignedEmployee().getId());
            dto.setAssignedEmployeeName(work.getAssignedEmployee().getUser().getFirstName() + " " + work.getAssignedEmployee().getUser().getLastName());
        }
        dto.setAssignedDate(work.getAssignedDate());
        dto.setCompleted(work.isCompleted());
        return dto;
    }
}
