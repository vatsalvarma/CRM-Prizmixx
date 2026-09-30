package com.prizmabrixx.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectAttachmentDTO {
    private Long id;
    private Long projectId;
    private String fileName;
    private String fileType;
    private String url; // the endpoint to download the file
    private LocalDateTime createdAt;
}
