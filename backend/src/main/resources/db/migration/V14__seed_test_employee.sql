-- Seed a test employee (password: admin123 - bcrypt hash)
INSERT INTO users (email, password_hash, first_name, last_name, status, role_id) 
VALUES ('employee@prizmabrixx.com', '$2a$10$Rz4t.bB2T9tW4O7R4Z/E.Ouq1XpS6l9G8nZ1kP5Jj/gUaG6yK8kKO', 'Jane', 'Doe', 'ACTIVE', (SELECT id FROM roles WHERE name = 'EMPLOYEE'));

-- Also insert into employees table
INSERT INTO employees (user_id, department_id, employment_status, joining_date)
VALUES (
    (SELECT id FROM users WHERE email = 'employee@prizmabrixx.com'),
    NULL,
    'PERMANENT',
    '2026-01-01'
);
