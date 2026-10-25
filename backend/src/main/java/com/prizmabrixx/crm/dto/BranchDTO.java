package com.prizmabrixx.crm.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchDTO {
    private Long id;
    private String name;
    private String code;
    private String city;
    private Boolean isActive;
    private Long employeeCount;
}
