package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Invoice;
import com.prizmabrixx.crm.domain.entity.Payment;
import com.prizmabrixx.crm.dto.InvoiceDTO;
import com.prizmabrixx.crm.dto.PaymentDTO;
import com.prizmabrixx.crm.repository.ClientRepository;
import com.prizmabrixx.crm.repository.InvoiceRepository;
import com.prizmabrixx.crm.repository.PaymentRepository;
import com.prizmabrixx.crm.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;

    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return mapToDTO(invoice);
    }

    @Transactional
    public InvoiceDTO createInvoice(InvoiceDTO dto) {
        Invoice invoice = Invoice.builder()
                .client(clientRepository.findById(dto.getClientId())
                        .orElseThrow(() -> new RuntimeException("Client not found")))
                .project(dto.getProjectId() != null ? projectRepository.findById(dto.getProjectId()).orElse(null) : null)
                .invoiceNumber(dto.getInvoiceNumber())
                .issueDate(dto.getIssueDate())
                .dueDate(dto.getDueDate())
                .subtotal(dto.getSubtotal())
                .totalAmount(dto.getTotalAmount())
                .status("DRAFT")
                .build();
        return mapToDTO(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceDTO updateInvoiceStatus(Long id, String newStatus) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(newStatus);
        return mapToDTO(invoiceRepository.save(invoice));
    }

    @Transactional
    public PaymentDTO addPayment(Long invoiceId, PaymentDTO dto) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
                
        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(dto.getAmount())
                .paymentDate(dto.getPaymentDate())
                .paymentMethod(dto.getPaymentMethod())
                .referenceNumber(dto.getReferenceNumber())
                .status("COMPLETED")
                .build();

        payment = paymentRepository.save(payment);

        // Calculate total payments
        List<Payment> allPayments = paymentRepository.findByInvoiceId(invoiceId);
        BigDecimal totalPaid = allPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus("PAID");
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus("PARTIALLY_PAID");
        }
        
        invoiceRepository.save(invoice);

        return PaymentDTO.builder()
                .id(payment.getId())
                .invoiceId(invoice.getId())
                .amount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .paymentMethod(payment.getPaymentMethod())
                .referenceNumber(payment.getReferenceNumber())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }
    
    public List<PaymentDTO> getPaymentsForInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(p -> PaymentDTO.builder()
                        .id(p.getId())
                        .invoiceId(p.getInvoice().getId())
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .paymentMethod(p.getPaymentMethod())
                        .referenceNumber(p.getReferenceNumber())
                        .status(p.getStatus())
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private InvoiceDTO mapToDTO(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .clientId(invoice.getClient().getId())
                .clientName(invoice.getClient().getCompanyName())
                .projectId(invoice.getProject() != null ? invoice.getProject().getId() : null)
                .projectName(invoice.getProject() != null ? invoice.getProject().getName() : null)
                .invoiceNumber(invoice.getInvoiceNumber())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .subtotal(invoice.getSubtotal())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
