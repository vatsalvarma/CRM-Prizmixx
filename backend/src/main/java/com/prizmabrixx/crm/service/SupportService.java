package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.domain.entity.SupportTicket;
import com.prizmabrixx.crm.domain.entity.TicketComment;
import com.prizmabrixx.crm.domain.entity.User;
import com.prizmabrixx.crm.dto.SupportTicketDTO;
import com.prizmabrixx.crm.dto.TicketCommentDTO;
import com.prizmabrixx.crm.repository.ClientRepository;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import com.prizmabrixx.crm.repository.SupportTicketRepository;
import com.prizmabrixx.crm.repository.TicketCommentRepository;
import com.prizmabrixx.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeService employeeService;

    public List<SupportTicketDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SupportTicketDTO getTicketById(Long id) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToDTO(ticket);
    }

    @Transactional
    public SupportTicketDTO createTicket(SupportTicketDTO dto) {
        Employee assignee = null;
        if (dto.getAssigneeId() != null) {
            assignee = employeeRepository.findById(dto.getAssigneeId()).orElse(null);
        }

        SupportTicket ticket = SupportTicket.builder()
                .client(dto.getClientId() != null ? clientRepository.findById(dto.getClientId()).orElse(null) : null)
                .subject(dto.getSubject())
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .status("OPEN")
                .assignee(assignee)
                .slaDueTime(LocalDateTime.now().plusDays(1)) // default SLA
                .escalationLevel(0)
                .build();
                
        return mapToDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public SupportTicketDTO updateTicketStatus(Long id, String status) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(status);
        return mapToDTO(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketCommentDTO addComment(Long ticketId, TicketCommentDTO dto, String userEmail) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
                
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .user(user)
                .comment(dto.getComment())
                .isInternal(dto.getIsInternal() != null ? dto.getIsInternal() : false)
                .build();

        return mapCommentToDTO(commentRepository.save(comment));
    }

    public List<TicketCommentDTO> getTicketComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::mapCommentToDTO)
                .collect(Collectors.toList());
    }

    private SupportTicketDTO mapToDTO(SupportTicket ticket) {
        return SupportTicketDTO.builder()
                .id(ticket.getId())
                .clientId(ticket.getClient() != null ? ticket.getClient().getId() : null)
                .clientName(ticket.getClient() != null ? ticket.getClient().getCompanyName() : null)
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .assigneeId(ticket.getAssignee() != null ? ticket.getAssignee().getId() : null)
                .assigneeName(ticket.getAssignee() != null ? 
                        ticket.getAssignee().getUser().getFirstName() + " " + ticket.getAssignee().getUser().getLastName() : null)
                .slaDueTime(ticket.getSlaDueTime())
                .escalationLevel(ticket.getEscalationLevel())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
    
    private TicketCommentDTO mapCommentToDTO(TicketComment comment) {
        return TicketCommentDTO.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getFirstName() + " " + comment.getUser().getLastName())
                .comment(comment.getComment())
                .isInternal(comment.getIsInternal())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
