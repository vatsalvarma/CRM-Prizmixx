-- V27: Advanced Project multi-stage pipeline with team leaders and stage assignees

ALTER TABLE projects
    ADD COLUMN project_type VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    ADD COLUMN team_leader_id BIGINT NULL,
    ADD COLUMN current_stage VARCHAR(50) DEFAULT 'DESIGN',
    ADD CONSTRAINT fk_projects_team_leader FOREIGN KEY (team_leader_id) REFERENCES employees(id) ON DELETE SET NULL;

CREATE TABLE project_stages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    stage_name VARCHAR(50) NOT NULL, -- 'DESIGN', 'RESOURCES', 'DEVELOP_TEST', 'DEPLOY'
    stage_order INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED'
    title VARCHAR(255),
    description TEXT,
    reference_links TEXT,
    submission_link TEXT,
    submission_notes TEXT,
    submitted_by_id BIGINT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by_id) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY uk_project_stage (project_id, stage_name)
);

CREATE TABLE project_stage_assignees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stage_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES project_stages(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY uk_stage_employee (stage_id, employee_id)
);
