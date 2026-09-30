package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Client;
import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.domain.entity.Project;
import com.prizmabrixx.crm.domain.entity.ProjectAttachment;
import com.prizmabrixx.crm.dto.ProjectAttachmentDTO;
import com.prizmabrixx.crm.dto.ProjectDTO;
import com.prizmabrixx.crm.repository.ClientRepository;
import com.prizmabrixx.crm.repository.ProjectRepository;
import com.prizmabrixx.crm.repository.DepartmentRepository;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import com.prizmabrixx.crm.domain.entity.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final EmployeeService employeeService;
    private final FileUploadService fileUploadService;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public List<ProjectDTO> getAllProjects(String email) {
        Employee employee = employeeService.getEmployeeByUserEmail(email);
        boolean isAdmin = employee.getUser().getRole().getName().equalsIgnoreCase("ADMIN") || 
                          employee.getUser().getRole().getName().equalsIgnoreCase("SYSTEM_MASTER");
        System.out.println("DEBUG getAllProjects - user: " + email + ", isAdmin: " + isAdmin);
        List<Project> projects = projectRepository.findAll();
        System.out.println("DEBUG getAllProjects - total projects in DB: " + projects.size());
        
        return projects.stream()
                .filter(proj -> {
                    if (isAdmin) return true;
                    // Employee can see it if it's assigned to them directly
                    if (proj.getAssignedEmployee() != null && proj.getAssignedEmployee().getId().equals(employee.getId())) {
                        System.out.println("DEBUG project " + proj.getId() + " visible to " + email + " via assigned employee");
                        return true;
                    }
                    // Or if it's assigned to their department
                    if (proj.getAssignedDepartment() != null && employee.getDepartment() != null &&
                        proj.getAssignedDepartment().getId().equals(employee.getDepartment().getId())) {
                        System.out.println("DEBUG project " + proj.getId() + " visible to " + email + " via assigned department");
                        return true;
                    }
                    return false;
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return mapToDTO(project);
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO dto, MultipartFile[] files, String managerEmail) {
        Employee manager = employeeService.getEmployeeByUserEmail(managerEmail);

        Client client;
        if (dto.getClientId() != null) {
            client = clientRepository.findById(dto.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client not found"));
        } else if (dto.getClientName() != null && !dto.getClientName().trim().isEmpty()) {
            client = clientRepository.findByCompanyName(dto.getClientName())
                    .orElseGet(() -> {
                        Client newClient = Client.builder()
                                .companyName(dto.getClientName())
                                .status("ACTIVE")
                                .owner(manager)
                                .build();
                        return clientRepository.save(newClient);
                    });
        } else {
            throw new RuntimeException("Client information is required");
        }

        Project.ProjectBuilder projectBuilder = Project.builder()
                .client(client)
                .name(dto.getName())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .referenceLinks(dto.getReferenceLinks())
                .status("INITIATION")
                .manager(manager)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate());

        if (dto.getAssignedDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getAssignedDepartmentId()).orElse(null);
            projectBuilder.assignedDepartment(dept);
        }
        if (dto.getAssignedEmployeeId() != null) {
            Employee emp = employeeRepository.findById(dto.getAssignedEmployeeId()).orElse(null);
            projectBuilder.assignedEmployee(emp);
        }
        Project project = projectBuilder.build();
                
        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = fileUploadService.storeFile(file);
                    ProjectAttachment attachment = ProjectAttachment.builder()
                            .project(project)
                            .fileName(file.getOriginalFilename())
                            .fileType(file.getContentType())
                            .filePath(fileName)
                            .build();
                    project.getAttachments().add(attachment);
                }
            }
        }

        return mapToDTO(projectRepository.save(project));
    }
    
    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project not found with id " + id);
        }
        projectRepository.deleteById(id);
    }

    private ProjectDTO mapToDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .clientId(project.getClient().getId())
                .clientName(project.getClient().getCompanyName())
                .name(project.getName())
                .title(project.getTitle())
                .description(project.getDescription())
                .referenceLinks(project.getReferenceLinks())
                .status(project.getStatus())
                .managerId(project.getManager() != null ? project.getManager().getId() : null)
                .managerName(project.getManager() != null ? 
                        project.getManager().getUser().getFirstName() + " " + project.getManager().getUser().getLastName() : null)
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdAt(project.getCreatedAt())
                .assignedDepartmentId(project.getAssignedDepartment() != null ? project.getAssignedDepartment().getId() : null)
                .assignedDepartmentName(project.getAssignedDepartment() != null ? project.getAssignedDepartment().getName() : null)
                .assignedEmployeeId(project.getAssignedEmployee() != null ? project.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(project.getAssignedEmployee() != null ? project.getAssignedEmployee().getUser().getFirstName() + " " + project.getAssignedEmployee().getUser().getLastName() : null)
                .attachments(project.getAttachments().stream().map(this::mapToAttachmentDTO).collect(Collectors.toList()))
                .build();
    }
    
    private ProjectAttachmentDTO mapToAttachmentDTO(ProjectAttachment attachment) {
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/projects/attachments/")
                .path(attachment.getFilePath())
                .toUriString();
                
        return ProjectAttachmentDTO.builder()
                .id(attachment.getId())
                .projectId(attachment.getProject().getId())
                .fileName(attachment.getFileName())
                .fileType(attachment.getFileType())
                .url(fileDownloadUri)
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}
