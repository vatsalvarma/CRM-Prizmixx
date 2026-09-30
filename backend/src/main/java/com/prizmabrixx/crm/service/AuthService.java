package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.User;
import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.dto.AuthRequest;
import com.prizmabrixx.crm.dto.AuthResponse;
import com.prizmabrixx.crm.repository.UserRepository;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import com.prizmabrixx.crm.security.CustomUserDetails;
import com.prizmabrixx.crm.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final JwtUtil jwtUtil;

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String departmentName = null;
        if ("ADMIN".equals(request.getType())) {
            String roleName = user.getRole().getName();
            if (!"ADMIN".equals(roleName) && !"SYSTEM_MASTER".equals(roleName)) {
                throw new RuntimeException("Admin access required");
            }
        } else if ("EMPLOYEE".equals(request.getType())) {
            Employee employee = employeeRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Employee record not found"));
            if (request.getDepartmentId() != null && !request.getDepartmentId().equals(employee.getDepartment().getId())) {
                throw new RuntimeException("wrong department");
            }
            if (employee.getDepartment() != null) {
                departmentName = employee.getDepartment().getName();
            }
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().getName())
                .departmentName(departmentName)
                .type("Bearer")
                .build();
    }
}
