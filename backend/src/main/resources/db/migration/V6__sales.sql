CREATE TABLE leads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_company VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    source VARCHAR(50),
    required_service VARCHAR(100),
    commercial_range VARCHAR(50),
    expected_decision DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- NEW, QUALIFIED, PROPOSAL_SENT, LOST, CONVERTED
    lost_reason VARCHAR(255),
    owner_id BIGINT,
    next_action VARCHAR(255),
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES employees(id)
);

CREATE TABLE lead_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lead_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- CALL, EMAIL, MEETING, NOTE
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
