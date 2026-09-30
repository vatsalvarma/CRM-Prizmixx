package com.prizmabrixx.crm.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorkDto {
    private Long id;
    private String name;
    private String description;
    private String referenceLinks;
    private String documentPdf;
    private Long departmentId;
    private String departmentName;
    private Long assignedEmployeeId;
    private String assignedEmployeeName;
    private LocalDateTime assignedDate;
    private boolean completed;
}
