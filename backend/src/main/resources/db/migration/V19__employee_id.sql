ALTER TABLE employees
ADD COLUMN employee_id VARCHAR(50) UNIQUE;

-- Seed departments if none exist
INSERT IGNORE INTO departments (name) VALUES 
('Developer'), 
('HR'), 
('Sales'), 
('Finance'), 
('Digital Marketing');
