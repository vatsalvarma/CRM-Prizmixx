package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.InvoiceDTO;
import com.prizmabrixx.crm.dto.PaymentDTO;
import com.prizmabrixx.crm.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@RequestBody InvoiceDTO dto) {
        return ResponseEntity.ok(invoiceService.createInvoice(dto));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<PaymentDTO>> getPayments(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getPaymentsForInvoice(id));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<PaymentDTO> addPayment(@PathVariable Long id, @RequestBody PaymentDTO paymentDTO) {
        return ResponseEntity.ok(invoiceService.addPayment(id, paymentDTO));
    }
}
