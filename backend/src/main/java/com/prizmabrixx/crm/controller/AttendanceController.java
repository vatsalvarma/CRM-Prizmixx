package com.prizmabrixx.crm.controller;

import com.prizmabrixx.crm.domain.entity.Attendance;
import com.prizmabrixx.crm.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<Attendance> checkIn(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.checkIn(authentication.getName()));
    }

    @GetMapping("/status")
    public ResponseEntity<Attendance> getTodayStatus(Authentication authentication) {
        Attendance attendance = attendanceService.getTodayAttendance(authentication.getName());
        return ResponseEntity.ok(attendance);
    }

    @PostMapping("/check-out")
    public ResponseEntity<Attendance> checkOut(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.checkOut(authentication.getName()));
    }
}
