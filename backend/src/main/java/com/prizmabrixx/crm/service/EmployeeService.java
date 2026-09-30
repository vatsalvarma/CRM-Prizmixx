package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Department;
import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.domain.entity.Role;
import com.prizmabrixx.crm.domain.entity.User;
import com.prizmabrixx.crm.dto.CreateEmployeeRequest;
import com.prizmabrixx.crm.dto.CreateEmployeeResponse;
import com.prizmabrixx.crm.dto.EmployeeDTO;
import com.prizmabrixx.crm.repository.DepartmentRepository;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import com.prizmabrixx.crm.repository.RoleRepository;
import com.prizmabrixx.crm.repository.UserRepository;
import com.prizmabrixx.crm.repository.LeaveBalanceRepository;
import com.prizmabrixx.crm.repository.LeaveTypeRepository;
import com.prizmabrixx.crm.repository.LeaveRequestRepository;
import com.prizmabrixx.crm.repository.ProjectRepository;
import com.prizmabrixx.crm.domain.entity.LeaveBalance;
import com.prizmabrixx.crm.domain.entity.LeaveType;
import com.prizmabrixx.crm.domain.entity.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ProjectRepository projectRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Employee getEmployeeByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee record not found for user"));
    }

    public EmployeeDTO getMyProfile(String email) {
        Employee employee = getEmployeeByUserEmail(email);
        return mapToDTO(employee);
    }
    
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CreateEmployeeResponse createEmployee(CreateEmployeeRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        String prefix = getDepartmentPrefix(department.getName());
        String maxId = employeeRepository.findMaxEmployeeIdByPrefix("EMP-" + prefix);
        
        int nextNum = 1;
        if (maxId != null && maxId.startsWith("EMP-" + prefix + "-")) {
            try {
                nextNum = Integer.parseInt(maxId.substring(maxId.lastIndexOf("-") + 1)) + 1;
            } catch (NumberFormatException ignored) {}
        }
        String newEmployeeId = String.format("EMP-%s-%03d", prefix, nextNum);
        
        String plainPassword = (request.getManualPassword() != null && !request.getManualPassword().isBlank()) 
                ? request.getManualPassword() 
                : UUID.randomUUID().toString().substring(0, 8);
        
        String email = request.getEmail();
        if (email == null || email.trim().isEmpty()) {
            email = request.getFirstName().toLowerCase() + "." + request.getLastName().toLowerCase() + "@prizmabrixx.com";
        }
        
        // Ensure email uniqueness
        if (userRepository.findByEmail(email).isPresent()) {
            email = request.getFirstName().toLowerCase() + "." + request.getLastName().toLowerCase() + "." + nextNum + "@prizmabrixx.com";
        }

        Role employeeRole = roleRepository.findByName("EMPLOYEE")
                .orElseThrow(() -> new RuntimeException("EMPLOYEE role not found"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(email)
                .passwordHash(passwordEncoder.encode(plainPassword))
                .role(employeeRole)
                .status("ACTIVE")
                .build();
        user = userRepository.save(user);

        Employee employee = Employee.builder()
                .user(user)
                .employeeId(newEmployeeId)
                .department(department)
                .joiningDate(LocalDate.now())
                .employmentStatus(request.getEmploymentStatus() != null ? request.getEmploymentStatus() : "PROBATION")
                .plainPassword(plainPassword)
                .build();
        employeeRepository.save(employee);

        // Initialize leave balances for the new employee
        List<LeaveType> allLeaveTypes = leaveTypeRepository.findAll();
        for (LeaveType type : allLeaveTypes) {
            LeaveBalance balance = LeaveBalance.builder()
                    .employee(employee)
                    .leaveType(type)
                    .balance(BigDecimal.valueOf(type.getDefaultDays()))
                    .build();
            leaveBalanceRepository.save(balance);
        }
        
        messagingTemplate.convertAndSend("/topic/employees", "{\"type\":\"UPDATE\"}");

        return CreateEmployeeResponse.builder()
                .employeeId(newEmployeeId)
                .email(email)
                .password(plainPassword)
                .build();
    }

    @Transactional
    public java.util.Map<String, String> resetPassword(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        User user = employee.getUser();
        String plainPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPasswordHash(passwordEncoder.encode(plainPassword));
        userRepository.save(user);
        
        employee.setPlainPassword(plainPassword);
        employeeRepository.save(employee);
        
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("newPassword", plainPassword);
        return response;
    }

    @Transactional
    public void deleteEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        Long userId = employee.getUser().getId();
        
        // Nullify project references
        List<Project> managedProjects = projectRepository.findByManagerId(employeeId);
        managedProjects.forEach(p -> { p.setManager(null); projectRepository.save(p); });
        
        List<Project> assignedProjects = projectRepository.findByAssignedEmployeeId(employeeId);
        assignedProjects.forEach(p -> { p.setAssignedEmployee(null); projectRepository.save(p); });
        
        // Delete leave records
        leaveBalanceRepository.deleteByEmployeeId(employeeId);
        leaveRequestRepository.deleteByEmployeeId(employeeId);
        
        employeeRepository.delete(employee);
        userRepository.deleteById(userId);
        
        messagingTemplate.convertAndSend("/topic/employees", "{\"type\":\"UPDATE\"}");
    }
    
    private String getDepartmentPrefix(String deptName) {
        if (deptName == null) return "GEN";
        String upper = deptName.toUpperCase();
        if (upper.contains("DEVELOP")) return "DEV";
        if (upper.contains("HR") || upper.contains("HUMAN")) return "HR";
        if (upper.contains("SALE")) return "SLS";
        if (upper.contains("FINAN")) return "FIN";
        if (upper.contains("MARKET") || upper.contains("DIGITAL")) return "MKT";
        return "GEN";
    }

    private EmployeeDTO mapToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeId())
                .userId(employee.getUser().getId())
                .email(employee.getUser().getEmail())
                .plainPassword(employee.getPlainPassword())
                .firstName(employee.getUser().getFirstName())
                .lastName(employee.getUser().getLastName())
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .managerId(employee.getManager() != null ? employee.getManager().getId() : null)
                .managerName(employee.getManager() != null ? 
                        employee.getManager().getUser().getFirstName() + " " + employee.getManager().getUser().getLastName() : null)
                .shift(employee.getShift())
                .site(employee.getSite())
                .employmentStatus(employee.getEmploymentStatus())
                .joiningDate(employee.getJoiningDate())
                .build();
    }
}
