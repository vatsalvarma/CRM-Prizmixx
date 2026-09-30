-- Also insert into employees table for Admin
INSERT INTO employees (user_id, department_id, employment_status, joining_date)
VALUES (
    (SELECT id FROM users WHERE email = 'admin@prizmabrixx.com'),
    NULL,
    'PERMANENT',
    '2026-01-01'
);
