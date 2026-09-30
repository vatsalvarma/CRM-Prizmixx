package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.*;
import com.prizmabrixx.crm.dto.LeadActivityDTO;
import com.prizmabrixx.crm.dto.LeadDTO;
import com.prizmabrixx.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadActivityRepository leadActivityRepository;
    private final EmployeeService employeeService;
    private final ClientRepository clientRepository;
    private final ClientContactRepository clientContactRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<LeadDTO> getAllLeads() {
        return leadRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public LeadDTO getLeadById(Long id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        return mapToDTO(lead);
    }

    @Transactional
    public LeadDTO createLead(LeadDTO leadDTO, String ownerEmail) {
        if (leadRepository.existsByClientCompanyAndEmail(leadDTO.getClientCompany(), leadDTO.getEmail())) {
            throw new RuntimeException("Possible duplicate lead detected");
        }
        
        Employee owner = employeeService.getEmployeeByUserEmail(ownerEmail);

        Lead lead = Lead.builder()
                .clientCompany(leadDTO.getClientCompany())
                .contactName(leadDTO.getContactName())
                .phone(leadDTO.getPhone())
                .email(leadDTO.getEmail())
                .source(leadDTO.getSource())
                .requiredService(leadDTO.getRequiredService())
                .projectName(leadDTO.getProjectName())
                .description(leadDTO.getDescription())
                .referenceLinks(leadDTO.getReferenceLinks())
                .documentUrl(leadDTO.getDocumentUrl())
                .expectedDecision(leadDTO.getExpectedDecision())
                .status("NEW")
                .owner(owner)
                .build();

        LeadDTO savedLeadDTO = mapToDTO(leadRepository.save(lead));
        messagingTemplate.convertAndSend("/topic/leads", savedLeadDTO);
        return savedLeadDTO;
    }

    @Transactional
    public LeadDTO updateLeadStatus(Long id, String newStatus, String email) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
                
        Employee actor = employeeService.getEmployeeByUserEmail(email);

        lead.setStatus(newStatus);
        lead = leadRepository.save(lead);

        // Auto-log activity
        LeadActivity activity = LeadActivity.builder()
                .lead(lead)
                .employee(actor)
                .activityType("NOTE")
                .description("Moved lead to status: " + newStatus)
                .build();
        leadActivityRepository.save(activity);

        // Convert to Client if CONVERTED
        if ("CONVERTED".equals(newStatus)) {
            convertToClient(lead);
        }

        LeadDTO updatedLeadDTO = mapToDTO(lead);
        messagingTemplate.convertAndSend("/topic/leads", updatedLeadDTO);
        return updatedLeadDTO;
    }

    @Transactional
    public LeadActivityDTO addActivity(Long leadId, LeadActivityDTO dto, String email) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        Employee employee = employeeService.getEmployeeByUserEmail(email);

        LeadActivity activity = LeadActivity.builder()
                .lead(lead)
                .employee(employee)
                .activityType(dto.getActivityType())
                .description(dto.getDescription())
                .build();

        activity = leadActivityRepository.save(activity);
        
        return LeadActivityDTO.builder()
                .id(activity.getId())
                .leadId(lead.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getUser().getFirstName() + " " + employee.getUser().getLastName())
                .activityType(activity.getActivityType())
                .description(activity.getDescription())
                .createdAt(activity.getCreatedAt())
                .build();
    }

    public List<LeadActivityDTO> getLeadActivities(Long leadId) {
        return leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(leadId).stream()
                .map(a -> LeadActivityDTO.builder()
                        .id(a.getId())
                        .leadId(a.getLead().getId())
                        .employeeId(a.getEmployee().getId())
                        .employeeName(a.getEmployee().getUser().getFirstName() + " " + a.getEmployee().getUser().getLastName())
                        .activityType(a.getActivityType())
                        .description(a.getDescription())
                        .createdAt(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private void convertToClient(Lead lead) {
        // Only convert if company name doesn't exist
        if (clientRepository.findByCompanyName(lead.getClientCompany()).isPresent()) {
            return;
        }

        Client client = Client.builder()
                .companyName(lead.getClientCompany())
                .industry(lead.getRequiredService())
                .status("ACTIVE")
                .owner(lead.getOwner())
                .build();
        client = clientRepository.save(client);

        ClientContact contact = ClientContact.builder()
                .client(client)
                .firstName(lead.getContactName())
                .lastName("") // Split logic can be added later
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .isPrimary(true)
                .build();
        clientContactRepository.save(contact);
    }

    private LeadDTO mapToDTO(Lead lead) {
        return LeadDTO.builder()
                .id(lead.getId())
                .clientCompany(lead.getClientCompany())
                .contactName(lead.getContactName())
                .phone(lead.getPhone())
                .email(lead.getEmail())
                .source(lead.getSource())
                .requiredService(lead.getRequiredService())
                .commercialRange(lead.getCommercialRange())
                .expectedDecision(lead.getExpectedDecision())
                .status(lead.getStatus())
                .lostReason(lead.getLostReason())
                .ownerId(lead.getOwner() != null ? lead.getOwner().getId() : null)
                .ownerName(lead.getOwner() != null ? 
                        lead.getOwner().getUser().getFirstName() + " " + lead.getOwner().getUser().getLastName() : null)
                .ownerDepartment(lead.getOwner() != null && lead.getOwner().getDepartment() != null ? 
                        lead.getOwner().getDepartment().getName() : null)
                .projectName(lead.getProjectName())
                .description(lead.getDescription())
                .referenceLinks(lead.getReferenceLinks())
                .documentUrl(lead.getDocumentUrl())
                .nextAction(lead.getNextAction())
                .dueDate(lead.getDueDate())
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }
}
