package com.prizmabrixx.crm.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String type; // "ADMIN" or "EMPLOYEE"
    private Long departmentId; // Optional, used for EMPLOYEE login
    private Long branchId; // Optional, used to filter/verify branch on login
}
