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
public class UpdateStageRequest {
    private String description;
    private String referenceLinks;
    private List<Long> assigneeEmployeeIds;
}
