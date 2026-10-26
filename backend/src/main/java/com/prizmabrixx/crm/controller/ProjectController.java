package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.AssignTeamLeaderRequest;
import com.prizmabrixx.crm.dto.ProjectDTO;
import com.prizmabrixx.crm.dto.ProjectStageDTO;
import com.prizmabrixx.crm.dto.SubmitStageRequest;
import com.prizmabrixx.crm.dto.UpdateStageRequest;
import com.prizmabrixx.crm.service.FileUploadService;
import com.prizmabrixx.crm.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final FileUploadService fileUploadService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getProjects(Authentication authentication) {
        return ResponseEntity.ok(projectService.getAllProjects(authentication.getName()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProjectDTO> createProject(
            @RequestPart("project") ProjectDTO projectDTO,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.createProject(projectDTO, files, authentication.getName()));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stages")
    public ResponseEntity<List<ProjectStageDTO>> getStages(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectStages(id));
    }

    @PutMapping("/{id}/team-leader")
    public ResponseEntity<ProjectDTO> assignTeamLeader(
            @PathVariable Long id,
            @RequestBody AssignTeamLeaderRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.assignTeamLeader(id, request.getTeamLeaderId(), authentication.getName()));
    }

    @PutMapping("/{id}/stages/{stageName}")
    public ResponseEntity<ProjectStageDTO> updateStage(
            @PathVariable Long id,
            @PathVariable String stageName,
            @RequestBody UpdateStageRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.updateStage(id, stageName, request, authentication.getName()));
    }

    @PostMapping("/{id}/stages/{stageName}/submit")
    public ResponseEntity<ProjectStageDTO> submitStage(
            @PathVariable Long id,
            @PathVariable String stageName,
            @RequestBody SubmitStageRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.submitStageWork(id, stageName, request, authentication.getName()));
    }

    @PostMapping("/{id}/stages/{stageName}/complete")
    public ResponseEntity<ProjectStageDTO> completeStage(
            @PathVariable Long id,
            @PathVariable String stageName,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.completeStage(id, stageName, authentication.getName()));
    }

    @PostMapping("/{id}/stages/{stageName}/reopen")
    public ResponseEntity<ProjectStageDTO> reopenStage(
            @PathVariable Long id,
            @PathVariable String stageName,
            Authentication authentication) {
        return ResponseEntity.ok(projectService.reopenStage(id, stageName, authentication.getName()));
    }
    
    @GetMapping("/attachments/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileUploadService.loadFileAsResource(fileName);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // fallback
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
