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
public class LeadActivityDTO {
    private Long id;
    private Long leadId;
    private Long employeeId;
    private String employeeName;
    private String activityType; // CALL, EMAIL, MEETING, NOTE
    private String description;
    private LocalDateTime createdAt;
}
