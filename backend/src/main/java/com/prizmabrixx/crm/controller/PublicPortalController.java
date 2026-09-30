package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.domain.entity.Lead;
import com.prizmabrixx.crm.domain.entity.SupportTicket;
import com.prizmabrixx.crm.dto.LeadDTO;
import com.prizmabrixx.crm.dto.SupportTicketDTO;
import com.prizmabrixx.crm.repository.LeadRepository;
import com.prizmabrixx.crm.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicPortalController {

    private final LeadRepository leadRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/projects")
    public ResponseEntity<?> submitProject(@RequestBody Map<String, String> payload) {
        Lead lead = new Lead();
        lead.setClientCompany(payload.getOrDefault("projectName", "Unknown Project"));
        lead.setContactName("Client Portal Request");
        lead.setRequiredService(payload.getOrDefault("description", ""));
        lead.setSource(payload.getOrDefault("referenceLinks", ""));
        lead.setStatus("NEW");
        lead.setEmail("portal@client.com"); // Dummy email
        
        lead = leadRepository.save(lead);
        
        LeadDTO dto = LeadDTO.builder()
                .id(lead.getId())
                .clientCompany(lead.getClientCompany())
                .contactName(lead.getContactName())
                .requiredService(lead.getRequiredService())
                .status(lead.getStatus())
                .createdAt(lead.getCreatedAt())
                .build();
                
        messagingTemplate.convertAndSend("/topic/leads", dto);
        return ResponseEntity.ok(Map.of("message", "Project submitted successfully!"));
    }

    @PostMapping("/tickets")
    public ResponseEntity<?> submitTicket(@RequestBody Map<String, String> payload) {
        SupportTicket ticket = new SupportTicket();
        ticket.setSubject("Portal Support Request: " + payload.getOrDefault("name", "User"));
        ticket.setDescription(
            "Name: " + payload.getOrDefault("name", "") + "\n" +
            "Phone: " + payload.getOrDefault("phone", "") + "\n" +
            "Problem: " + payload.getOrDefault("description", "") + "\n" +
            "Link/Doc: " + payload.getOrDefault("attachmentLink", "")
        );
        ticket.setPriority("HIGH");
        ticket.setStatus("OPEN");
        
        ticket = supportTicketRepository.save(ticket);
        
        SupportTicketDTO dto = SupportTicketDTO.builder()
                .id(ticket.getId())
                .clientName(payload.getOrDefault("name", "Public Portal User"))
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .build();
                
        messagingTemplate.convertAndSend("/topic/tickets", dto);
        return ResponseEntity.ok(Map.of("message", "Ticket raised successfully!"));
    }
}
