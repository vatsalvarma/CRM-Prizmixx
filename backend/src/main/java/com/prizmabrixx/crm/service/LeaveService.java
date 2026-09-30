package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.domain.entity.LeaveBalance;
import com.prizmabrixx.crm.domain.entity.LeaveRequest;
import com.prizmabrixx.crm.domain.entity.LeaveType;
import com.prizmabrixx.crm.dto.LeaveBalanceDTO;
import com.prizmabrixx.crm.dto.LeaveRequestDTO;
import com.prizmabrixx.crm.repository.LeaveBalanceRepository;
import com.prizmabrixx.crm.repository.LeaveRequestRepository;
import com.prizmabrixx.crm.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeService employeeService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<LeaveBalanceDTO> getMyBalances(String email) {
        Employee employee = employeeService.getEmployeeByUserEmail(email);
        return leaveBalanceRepository.findByEmployeeId(employee.getId()).stream()
                .map(b -> LeaveBalanceDTO.builder()
                        .id(b.getId())
                        .leaveTypeId(b.getLeaveType().getId())
                        .leaveTypeName(b.getLeaveType().getName())
                        .balance(b.getBalance())
                        .build())
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getMyRequests(String email) {
        Employee employee = employeeService.getEmployeeByUserEmail(email);
        return leaveRequestRepository.findByEmployeeId(employee.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getAllPendingRequests() {
        return leaveRequestRepository.findAll().stream()
                .filter(r -> "SUBMITTED".equals(r.getStatus()) || "UNDER_REVIEW".equals(r.getStatus()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestDTO submitLeaveRequest(String email, LeaveRequestDTO dto) {
        Employee employee = employeeService.getEmployeeByUserEmail(email);
        LeaveType leaveType = leaveTypeRepository.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            System.out.println("Start date after end date: " + dto.getStartDate() + " > " + dto.getEndDate());
            throw new RuntimeException("Start date cannot be after end date");
        }

        long daysRequested = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;
        System.out.println("Days requested: " + daysRequested);

        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeId(employee.getId(), leaveType.getId())
                .orElseThrow(() -> {
                    System.out.println("Balance not found for emp=" + employee.getId() + " leaveType=" + leaveType.getId());
                    return new RuntimeException("Leave balance not found for this type");
                });

        System.out.println("Found balance: " + balance.getBalance() + " for leave type: " + leaveType.getName());

        if (!"Unpaid Leave".equalsIgnoreCase(leaveType.getName()) && balance.getBalance().compareTo(BigDecimal.valueOf(daysRequested)) < 0) {
            System.out.println("Insufficient balance. Balance=" + balance.getBalance() + " Requested=" + daysRequested);
            throw new RuntimeException("Insufficient leave balance");
        }

        LeaveRequest request = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status("SUBMITTED")
                .build();

        LeaveRequest savedRequest = leaveRequestRepository.save(request);
        
        notificationService.notifyAdmins(
            "New Leave Request", 
            employee.getUser().getFirstName() + " requested leave from " + dto.getStartDate() + " to " + dto.getEndDate()
        );
        
        LeaveRequestDTO savedDTO = mapToDTO(savedRequest);
        messagingTemplate.convertAndSend("/topic/leaves", savedDTO);
        return savedDTO;
    }

    @Transactional
    public LeaveRequestDTO approveRequest(String approverEmail, Long requestId) {
        Employee approver = employeeService.getEmployeeByUserEmail(approverEmail);
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!"SUBMITTED".equals(request.getStatus()) && !"UNDER_REVIEW".equals(request.getStatus())) {
            throw new RuntimeException("Leave request is not in a pending state");
        }
        
        if (request.getEmployee().getId().equals(approver.getId())) {
            throw new RuntimeException("You cannot approve your own leave request");
        }

        long daysRequested = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeId(
                request.getEmployee().getId(), request.getLeaveType().getId())
                .orElseThrow(() -> new RuntimeException("Leave balance not found for this type"));

        if (!"Unpaid Leave".equalsIgnoreCase(request.getLeaveType().getName())) {
            if (balance.getBalance().compareTo(BigDecimal.valueOf(daysRequested)) < 0) {
                throw new RuntimeException("Insufficient leave balance to approve this request");
            }

            // Deduct balance
            balance.setBalance(balance.getBalance().subtract(BigDecimal.valueOf(daysRequested)));
            leaveBalanceRepository.save(balance);
        }

        request.setStatus("APPROVED");
        request.setApprover(approver);
        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        notificationService.notifyEmployee(
            request.getEmployee().getId(),
            "Leave Request Approved",
            "Your leave from " + request.getStartDate() + " to " + request.getEndDate() + " has been approved."
        );

        LeaveRequestDTO savedDTO = mapToDTO(savedRequest);
        messagingTemplate.convertAndSend("/topic/leaves", savedDTO);
        return savedDTO;
    }

    @Transactional
    public LeaveRequestDTO rejectRequest(String approverEmail, Long requestId, String rejectionReason) {
        Employee approver = employeeService.getEmployeeByUserEmail(approverEmail);
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!"SUBMITTED".equals(request.getStatus()) && !"UNDER_REVIEW".equals(request.getStatus())) {
            throw new RuntimeException("Leave request is not in a pending state");
        }

        request.setStatus("REJECTED");
        request.setApprover(approver);
        request.setRejectionReason(rejectionReason);
        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        notificationService.notifyEmployee(
            request.getEmployee().getId(),
            "Leave Request Rejected",
            "Your leave from " + request.getStartDate() + " to " + request.getEndDate() + " was rejected."
        );

        LeaveRequestDTO savedDTO = mapToDTO(savedRequest);
        messagingTemplate.convertAndSend("/topic/leaves", savedDTO);
        return savedDTO;
    }

    private LeaveRequestDTO mapToDTO(LeaveRequest request) {
        return LeaveRequestDTO.builder()
                .id(request.getId())
                .leaveTypeId(request.getLeaveType().getId())
                .leaveTypeName(request.getLeaveType().getName())
                .employeeName(request.getEmployee().getUser().getFirstName() + " " + request.getEmployee().getUser().getLastName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(request.getStatus())
                .approverId(request.getApprover() != null ? request.getApprover().getId() : null)
                .approverName(request.getApprover() != null ? 
                        request.getApprover().getUser().getFirstName() + " " + request.getApprover().getUser().getLastName() : null)
                .rejectionReason(request.getRejectionReason())
                .build();
    }
}
