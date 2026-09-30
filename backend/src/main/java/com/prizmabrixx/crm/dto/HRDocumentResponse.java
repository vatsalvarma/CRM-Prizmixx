package com.prizmabrixx.crm.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HRDocumentResponse {
    private Long id;
    private String documentName;
    private String documentType;
    private String status;
    private String fileUrl;
    private LocalDateTime updatedAt;
}
