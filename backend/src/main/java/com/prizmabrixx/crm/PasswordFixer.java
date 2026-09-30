package com.prizmabrixx.crm;

import com.prizmabrixx.crm.domain.entity.User;
import com.prizmabrixx.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PasswordFixer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Optional<User> optionalUser = userRepository.findByEmail("admin@prizmabrixx.com");
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            System.out.println("FIXING ADMIN PASSWORD...");
            user.setPasswordHash(passwordEncoder.encode("admin123"));
            userRepository.save(user);
            System.out.println("ADMIN PASSWORD FIXED to admin123");
        }

        Optional<User> optionalEmployee = userRepository.findByEmail("employee@prizmabrixx.com");
        if (optionalEmployee.isPresent()) {
            User employee = optionalEmployee.get();
            employee.setPasswordHash(passwordEncoder.encode("admin123"));
            userRepository.save(employee);
            System.out.println("EMPLOYEE PASSWORD FIXED to admin123");
        }
    }
}
