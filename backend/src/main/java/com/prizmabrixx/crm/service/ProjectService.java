package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Client;
import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.domain.entity.Project;
import com.prizmabrixx.crm.domain.entity.ProjectAttachment;
import com.prizmabrixx.crm.domain.entity.ProjectStage;
import com.prizmabrixx.crm.domain.entity.Department;
import com.prizmabrixx.crm.dto.EmployeeDTO;
import com.prizmabrixx.crm.dto.ProjectAttachmentDTO;
import com.prizmabrixx.crm.dto.ProjectDTO;
import com.prizmabrixx.crm.dto.ProjectStageDTO;
import com.prizmabrixx.crm.dto.SubmitStageRequest;
import com.prizmabrixx.crm.dto.UpdateStageRequest;
import com.prizmabrixx.crm.repository.ClientRepository;
import com.prizmabrixx.crm.repository.DepartmentRepository;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import com.prizmabrixx.crm.repository.ProjectRepository;
import com.prizmabrixx.crm.repository.ProjectStageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectStageRepository projectStageRepository;
    private final ClientRepository clientRepository;
    private final EmployeeService employeeService;
    private final FileUploadService fileUploadService;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public List<ProjectDTO> getAllProjects(String email) {
        Employee employee = employeeService.getEmployeeByUserEmail(email);
        boolean isAdmin = employee.getUser().getRole().getName().equalsIgnoreCase("ADMIN") || 
                          employee.getUser().getRole().getName().equalsIgnoreCase("SYSTEM_MASTER");
        List<Project> projects = projectRepository.findAll();
        
        return projects.stream()
                .filter(proj -> {
                    if (isAdmin) return true;
                    // Directly assigned employee
                    if (proj.getAssignedEmployee() != null && proj.getAssignedEmployee().getId().equals(employee.getId())) {
                        return true;
                    }
                    // Assigned department
                    if (proj.getAssignedDepartment() != null && employee.getDepartment() != null &&
                        proj.getAssignedDepartment().getId().equals(employee.getDepartment().getId())) {
                        return true;
                    }
                    // Team leader of advanced project
                    if (proj.getTeamLeader() != null && proj.getTeamLeader().getId().equals(employee.getId())) {
                        return true;
                    }
                    // Stage assignee in advanced project
                    boolean isStageAssignee = proj.getStages().stream()
                            .anyMatch(st -> st.getAssignees().stream().anyMatch(a -> a.getId().equals(employee.getId())));
                    if (isStageAssignee) {
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

        boolean isAdvanced = "ADVANCED".equalsIgnoreCase(dto.getProjectType());

        Project.ProjectBuilder projectBuilder = Project.builder()
                .client(client)
                .name(dto.getName())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .referenceLinks(dto.getReferenceLinks())
                .status("INITIATION")
                .manager(manager)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .projectType(isAdvanced ? "ADVANCED" : "NORMAL")
                .currentStage(isAdvanced ? "DESIGN" : "DESIGN");

        if (isAdvanced && dto.getTeamLeaderId() != null) {
            Employee teamLeader = employeeRepository.findById(dto.getTeamLeaderId()).orElse(null);
            projectBuilder.teamLeader(teamLeader);
        }

        if (dto.getAssignedDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getAssignedDepartmentId()).orElse(null);
            projectBuilder.assignedDepartment(dept);
        }
        if (dto.getAssignedEmployeeId() != null) {
            Employee emp = employeeRepository.findById(dto.getAssignedEmployeeId()).orElse(null);
            projectBuilder.assignedEmployee(emp);
        }
        
        Project project = projectRepository.save(projectBuilder.build());

        // For advanced projects, automatically initialize the 4 stages
        if (isAdvanced) {
            List<ProjectStage> stages = new ArrayList<>();

            stages.add(ProjectStage.builder()
                    .project(project)
                    .stageName("DESIGN")
                    .stageOrder(1)
                    .status("IN_PROGRESS")
                    .title("Design & Prototyping")
                    .description("Create wireframes, mockups, UI/UX designs, and design systems.")
                    .build());

            stages.add(ProjectStage.builder()
                    .project(project)
                    .stageName("RESOURCES")
                    .stageOrder(2)
                    .status("PENDING")
                    .title("Resources & Assets")
                    .description("Gather design assets, database schema, third-party API keys, icons, and dependencies.")
                    .build());

            stages.add(ProjectStage.builder()
                    .project(project)
                    .stageName("DEVELOP_TEST")
                    .stageOrder(3)
                    .status("PENDING")
                    .title("Develop & Test")
                    .description("Build core features, frontend/backend implementation, unit testing, and bug fixing.")
                    .build());

            stages.add(ProjectStage.builder()
                    .project(project)
                    .stageName("DEPLOY")
                    .stageOrder(4)
                    .status("PENDING")
                    .title("Deploy & Production")
                    .description("Deploy to production/staging, configure CI/CD pipeline, and perform final smoke testing.")
                    .build());

            projectStageRepository.saveAll(stages);
            project.setStages(stages);
        }
                
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
            projectRepository.save(project);
        }

        return mapToDTO(project);
    }
    
    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project not found with id " + id);
        }
        projectRepository.deleteById(id);
    }

    public List<ProjectStageDTO> getProjectStages(Long projectId) {
        return projectStageRepository.findByProjectIdOrderByStageOrderAsc(projectId).stream()
                .map(this::mapStageToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO assignTeamLeader(Long projectId, Long teamLeaderId, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Employee teamLeader = null;
        if (teamLeaderId != null) {
            teamLeader = employeeRepository.findById(teamLeaderId)
                    .orElseThrow(() -> new RuntimeException("Employee not found with id " + teamLeaderId));
        }
        project.setTeamLeader(teamLeader);
        return mapToDTO(projectRepository.save(project));
    }

    @Transactional
    public ProjectStageDTO updateStage(Long projectId, String stageName, UpdateStageRequest request, String userEmail) {
        ProjectStage stage = projectStageRepository.findByProjectIdAndStageName(projectId, stageName.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Stage " + stageName + " not found for project " + projectId));

        if (request.getDescription() != null) {
            stage.setDescription(request.getDescription());
        }
        if (request.getReferenceLinks() != null) {
            stage.setReferenceLinks(request.getReferenceLinks());
        }
        if (request.getAssigneeEmployeeIds() != null) {
            List<Employee> assignees = employeeRepository.findAllById(request.getAssigneeEmployeeIds());
            stage.setAssignees(assignees);
        }

        return mapStageToDTO(projectStageRepository.save(stage));
    }

    @Transactional
    public ProjectStageDTO submitStageWork(Long projectId, String stageName, SubmitStageRequest request, String userEmail) {
        ProjectStage stage = projectStageRepository.findByProjectIdAndStageName(projectId, stageName.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Stage " + stageName + " not found for project " + projectId));

        Employee employee = employeeService.getEmployeeByUserEmail(userEmail);

        stage.setSubmissionLink(request.getSubmissionLink());
        stage.setSubmissionNotes(request.getSubmissionNotes());
        stage.setSubmittedBy(employee);

        return mapStageToDTO(projectStageRepository.save(stage));
    }

    @Transactional
    public ProjectStageDTO completeStage(Long projectId, String stageName, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        ProjectStage stage = projectStageRepository.findByProjectIdAndStageName(projectId, stageName.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Stage " + stageName + " not found for project " + projectId));

        Employee employee = employeeService.getEmployeeByUserEmail(userEmail);

        stage.setStatus("COMPLETED");
        stage.setCompletedAt(LocalDateTime.now());
        if (stage.getSubmittedBy() == null) {
            stage.setSubmittedBy(employee);
        }
        projectStageRepository.save(stage);

        // Find next stage in sequence
        Integer nextOrder = stage.getStageOrder() + 1;
        ProjectStage nextStage = projectStageRepository.findByProjectIdAndStageOrder(projectId, nextOrder).orElse(null);

        if (nextStage != null) {
            if ("PENDING".equals(nextStage.getStatus())) {
                nextStage.setStatus("IN_PROGRESS");
                projectStageRepository.save(nextStage);
            }
            project.setCurrentStage(nextStage.getStageName());
            project.setStatus("EXECUTION");
        } else {
            // All stages complete!
            project.setCurrentStage("COMPLETED");
            project.setStatus("COMPLETED");
        }

        projectRepository.save(project);
        return mapStageToDTO(stage);
    }

    @Transactional
    public ProjectStageDTO reopenStage(Long projectId, String stageName, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        ProjectStage stage = projectStageRepository.findByProjectIdAndStageName(projectId, stageName.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Stage " + stageName + " not found for project " + projectId));

        stage.setStatus("IN_PROGRESS");
        stage.setCompletedAt(null);
        projectStageRepository.save(stage);

        project.setCurrentStage(stage.getStageName());
        project.setStatus("EXECUTION");
        projectRepository.save(project);

        return mapStageToDTO(stage);
    }

    private ProjectDTO mapToDTO(Project project) {
        List<ProjectStageDTO> stageDTOs = project.getStages() != null ?
                project.getStages().stream().map(this::mapStageToDTO).collect(Collectors.toList()) :
                new ArrayList<>();

        return ProjectDTO.builder()
                .id(project.getId())
                .clientId(project.getClient().getId())
                .clientName(project.getClient().getCompanyName())
                .name(project.getName())
                .title(project.getTitle())
                .description(project.getDescription())
                .referenceLinks(project.getReferenceLinks())
                .status(project.getStatus())
                .projectType(project.getProjectType() != null ? project.getProjectType() : "NORMAL")
                .teamLeaderId(project.getTeamLeader() != null ? project.getTeamLeader().getId() : null)
                .teamLeaderName(project.getTeamLeader() != null && project.getTeamLeader().getUser() != null ? 
                        project.getTeamLeader().getUser().getFirstName() + " " + project.getTeamLeader().getUser().getLastName() : null)
                .currentStage(project.getCurrentStage() != null ? project.getCurrentStage() : "DESIGN")
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
                .stages(stageDTOs)
                .attachments(project.getAttachments().stream().map(this::mapToAttachmentDTO).collect(Collectors.toList()))
                .build();
    }

    public ProjectStageDTO mapStageToDTO(ProjectStage stage) {
        List<EmployeeDTO> assigneeDTOs = stage.getAssignees() != null ?
                stage.getAssignees().stream().map(this::mapEmployeeToDTO).collect(Collectors.toList()) :
                new ArrayList<>();

        String submittedByName = null;
        if (stage.getSubmittedBy() != null && stage.getSubmittedBy().getUser() != null) {
            submittedByName = stage.getSubmittedBy().getUser().getFirstName() + " " + stage.getSubmittedBy().getUser().getLastName();
        }

        return ProjectStageDTO.builder()
                .id(stage.getId())
                .projectId(stage.getProject().getId())
                .stageName(stage.getStageName())
                .stageOrder(stage.getStageOrder())
                .status(stage.getStatus())
                .title(stage.getTitle())
                .description(stage.getDescription())
                .referenceLinks(stage.getReferenceLinks())
                .submissionLink(stage.getSubmissionLink())
                .submissionNotes(stage.getSubmissionNotes())
                .submittedById(stage.getSubmittedBy() != null ? stage.getSubmittedBy().getId() : null)
                .submittedByName(submittedByName)
                .completedAt(stage.getCompletedAt())
                .assignees(assigneeDTOs)
                .createdAt(stage.getCreatedAt())
                .updatedAt(stage.getUpdatedAt())
                .build();
    }

    private EmployeeDTO mapEmployeeToDTO(Employee employee) {
        if (employee == null) return null;
        return EmployeeDTO.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeId())
                .userId(employee.getUser() != null ? employee.getUser().getId() : null)
                .email(employee.getUser() != null ? employee.getUser().getEmail() : null)
                .firstName(employee.getUser() != null ? employee.getUser().getFirstName() : "")
                .lastName(employee.getUser() != null ? employee.getUser().getLastName() : "")
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .branchName(employee.getBranch() != null ? employee.getBranch().getName() : null)
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
