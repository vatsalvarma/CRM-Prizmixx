-- Seed default leave types
INSERT INTO leave_types (name, default_days) VALUES 
('Annual Leave', 20),
('Sick Leave', 10),
('Maternity Leave', 90),
('Paternity Leave', 14),
('Unpaid Leave', 0)
ON DUPLICATE KEY UPDATE default_days = VALUES(default_days);

-- Also give the test employee some default balances for these leave types
INSERT INTO leave_balances (employee_id, leave_type_id, balance)
SELECT e.id, lt.id, lt.default_days
FROM employees e
CROSS JOIN leave_types lt
WHERE e.user_id = (SELECT id FROM users WHERE email = 'employee@prizmabrixx.com')
ON DUPLICATE KEY UPDATE balance = VALUES(balance);
