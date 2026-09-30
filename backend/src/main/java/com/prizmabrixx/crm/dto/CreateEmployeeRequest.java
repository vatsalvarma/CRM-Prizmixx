package com.prizmabrixx.crm.dto;

import lombok.Data;

@Data
public class CreateEmployeeRequest {
    private String firstName;
    private String lastName;
    private Long departmentId;
    private String manualPassword;
    private String email;
    private String employmentStatus;
}
