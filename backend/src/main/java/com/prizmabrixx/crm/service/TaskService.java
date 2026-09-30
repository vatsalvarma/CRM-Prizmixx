package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.domain.entity.Task;
import com.prizmabrixx.crm.dto.TaskDTO;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import com.prizmabrixx.crm.repository.ProjectRepository;
import com.prizmabrixx.crm.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<TaskDTO> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO createTask(TaskDTO dto, String creatorEmail) {
        // By default, if assignee is not provided, maybe leave it null or assign to creator.
        // Let's assume the frontend passes the assigneeId if needed.
        Employee assignee = null;
        if (dto.getAssigneeId() != null) {
            assignee = employeeRepository.findById(dto.getAssigneeId()).orElse(null);
        }

        Task task = Task.builder()
                .project(projectRepository.findById(dto.getProjectId())
                        .orElseThrow(() -> new RuntimeException("Project not found")))
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status("TODO")
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .assignee(assignee)
                .dueDate(dto.getDueDate())
                .build();

        Task savedTask = taskRepository.save(task);
        messagingTemplate.convertAndSend("/topic/projects/" + dto.getProjectId() + "/tasks", "update");
        return mapToDTO(savedTask);
    }

    @Transactional
    public TaskDTO updateTaskStatus(Long taskId, String newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(newStatus);
        Task savedTask = taskRepository.save(task);
        messagingTemplate.convertAndSend("/topic/projects/" + task.getProject().getId() + "/tasks", "update");
        return mapToDTO(savedTask);
    }

    private TaskDTO mapToDTO(Task task) {
        return TaskDTO.builder()
                .id(task.getId())
                .projectId(task.getProject().getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeName(task.getAssignee() != null ? 
                        task.getAssignee().getUser().getFirstName() + " " + task.getAssignee().getUser().getLastName() : null)
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
