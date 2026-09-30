package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Attendance;
import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.domain.entity.User;
import com.prizmabrixx.crm.repository.AttendanceRepository;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import com.prizmabrixx.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Attendance getTodayAttendance(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));
        return attendanceRepository.findByEmployeeIdAndWorkDate(employee.getId(), LocalDate.now())
                .orElse(null);
    }

    @Transactional
    public Attendance checkIn(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));

        LocalDate today = LocalDate.now();
        if (attendanceRepository.findByEmployeeIdAndWorkDate(employee.getId(), today).isPresent()) {
            throw new RuntimeException("Already checked in today");
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .workDate(today)
                .checkIn(LocalDateTime.now())
                .status("PRESENT")
                .lateFlag(false) // Logic for late flag can be added here
                .missingCheckout(true)
                .build();

        attendance = attendanceRepository.save(attendance);
        
        try {
            notificationService.notifyAdmins("New Check-In", user.getFirstName() + " " + user.getLastName() + " has checked in for the day.");
        } catch (Exception e) {
            // Ignore notification errors
        }
        
        return attendance;
    }

    @Transactional
    public Attendance checkOut(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndWorkDate(employee.getId(), today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        if (attendance.getCheckOut() != null) {
            throw new RuntimeException("Already checked out today");
        }

        attendance.setCheckOut(LocalDateTime.now());
        attendance.setMissingCheckout(false);
        // Calculate worked minutes here if needed

        return attendanceRepository.save(attendance);
    }
}
