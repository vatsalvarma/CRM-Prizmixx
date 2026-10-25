CREATE TABLE branches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    city VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed the default Hyderabad branch
INSERT INTO branches (name, code, city) VALUES ('Hyderabad', 'HYD', 'Hyderabad');

-- Add branch_id column to employees table
ALTER TABLE employees ADD COLUMN branch_id BIGINT;
ALTER TABLE employees ADD CONSTRAINT fk_employee_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- Move ALL existing employees to the Hyderabad branch
UPDATE employees SET branch_id = (SELECT id FROM branches WHERE code = 'HYD') WHERE branch_id IS NULL;
