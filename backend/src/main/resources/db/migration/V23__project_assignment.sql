ALTER TABLE projects ADD COLUMN assigned_department_id BIGINT NULL;
ALTER TABLE projects ADD COLUMN assigned_employee_id BIGINT NULL;
ALTER TABLE projects ADD CONSTRAINT fk_proj_assigned_dept FOREIGN KEY (assigned_department_id) REFERENCES departments(id);
ALTER TABLE projects ADD CONSTRAINT fk_proj_assigned_emp FOREIGN KEY (assigned_employee_id) REFERENCES employees(id);