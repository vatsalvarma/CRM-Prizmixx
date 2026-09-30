package com.prizmabrixx.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientDTO {
    private Long id;
    private String companyName;
    private String industry;
    private String website;
    private String status;
    private Long ownerId;
    private String ownerName;
    private List<ClientContactDTO> contacts;
}
