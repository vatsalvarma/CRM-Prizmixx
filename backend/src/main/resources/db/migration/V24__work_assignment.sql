CREATE TABLE works (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    reference_links VARCHAR(255),
    document_pdf VARCHAR(255),
    department_id BIGINT,
    employee_id BIGINT,
    assigned_date DATETIME,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
