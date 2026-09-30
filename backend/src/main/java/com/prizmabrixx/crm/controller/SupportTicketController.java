package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.dto.SupportTicketDTO;
import com.prizmabrixx.crm.dto.TicketCommentDTO;
import com.prizmabrixx.crm.service.SupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportService supportService;

    @GetMapping
    public ResponseEntity<List<SupportTicketDTO>> getTickets() {
        return ResponseEntity.ok(supportService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketDTO> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(supportService.getTicketById(id));
    }

    @PostMapping
    public ResponseEntity<SupportTicketDTO> createTicket(@RequestBody SupportTicketDTO dto) {
        return ResponseEntity.ok(supportService.createTicket(dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SupportTicketDTO> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(supportService.updateTicketStatus(id, body.get("status")));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(supportService.getTicketComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentDTO> addComment(@PathVariable Long id, @RequestBody TicketCommentDTO dto, Authentication authentication) {
        return ResponseEntity.ok(supportService.addComment(id, dto, authentication.getName()));
    }
}
