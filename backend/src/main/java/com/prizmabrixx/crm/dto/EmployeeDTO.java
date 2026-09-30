package com.prizmabrixx.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String employeeId;
    private Long userId;
    private String email;
    private String plainPassword;
    private String firstName;
    private String lastName;
    private String departmentName;
    private Long managerId;
    private String managerName;
    private String shift;
    private String site;
    private String employmentStatus;
    private LocalDate joiningDate;
}
