ALTER TABLE projects
ADD COLUMN title VARCHAR(255),
ADD COLUMN description TEXT,
ADD COLUMN reference_links TEXT;

CREATE TABLE project_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_attachments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
