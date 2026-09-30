package com.prizmabrixx.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentDTO {
    private Long id;
    private Long ticketId;
    private Long userId;
    private String userName;
    private String comment;
    private Boolean isInternal;
    private LocalDateTime createdAt;
}
