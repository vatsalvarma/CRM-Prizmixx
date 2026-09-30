INSERT INTO departments (name) VALUES 
('Developer'),
('Sales'),
('HR'),
('Finance'),
('Digital Marketing')
ON DUPLICATE KEY UPDATE name=name;
