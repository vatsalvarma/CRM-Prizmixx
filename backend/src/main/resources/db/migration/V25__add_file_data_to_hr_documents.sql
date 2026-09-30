ALTER TABLE hr_documents 
ADD COLUMN file_data LONGBLOB,
ADD COLUMN file_content_type VARCHAR(100);
