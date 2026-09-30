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
public class SupportTicketDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private String subject;
    private String description;
    private String priority;
    private String status;
    private Long assigneeId;
    private String assigneeName;
    private LocalDateTime slaDueTime;
    private Integer escalationLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
