package com.prizmabrixx.crm.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBranchRequest {
    private String name;
    private String code;
    private String city;
}
