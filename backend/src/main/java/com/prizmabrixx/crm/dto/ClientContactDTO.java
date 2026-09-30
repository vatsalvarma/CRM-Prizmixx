package com.prizmabrixx.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientContactDTO {
    private Long id;
    private Long clientId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Boolean isPrimary;
}
