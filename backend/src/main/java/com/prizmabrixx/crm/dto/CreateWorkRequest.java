package com.prizmabrixx.crm.dto;

import lombok.Data;

@Data
public class CreateWorkRequest {
    private String name;
    private String description;
    private String referenceLinks;
    private String documentPdf;
    private Long departmentId;
    private Long assignedEmployeeId;
}
