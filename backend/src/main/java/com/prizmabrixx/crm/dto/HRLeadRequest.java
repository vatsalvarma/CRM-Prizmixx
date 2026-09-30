package com.prizmabrixx.crm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HRLeadRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Long departmentId;
    private String position;
    private String status;
}
