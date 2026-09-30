package com.prizmabrixx.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long projectId;
    private String projectName;
    private String invoiceNumber;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
    private String status; // DRAFT, ISSUED, PARTIALLY_PAID, PAID, CANCELLED, OVERDUE
    private LocalDateTime createdAt;
}
