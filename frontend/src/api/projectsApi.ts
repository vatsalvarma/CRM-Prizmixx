import { axiosClient } from './axiosClient';

export interface ProjectAttachment {
  id: number;
  projectId: number;
  fileName: string;
  fileType: string;
  url: string;
  createdAt: string;
}

export interface Project {
  id: number;
  clientId: number;
  clientName: string;
  name: string;
  title?: string;
  description?: string;
  referenceLinks?: string;
  attachments?: ProjectAttachment[];
  status: string;
  managerId?: number;
  managerName?: string;
  startDate?: string;
  endDate?: string;
  assignedDepartmentName?: string;
  assignedEmployeeName?: string;
  createdAt: string;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: string; // TODO, IN_PROGRESS, REVIEW, BLOCKED, COMPLETED
  priority: string; // LOW, MEDIUM, HIGH
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await axiosClient.get('/projects');
  return response.data;
};

export const getProject = async (id: number): Promise<Project> => {
  const response = await axiosClient.get(`/projects/${id}`);
  return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await axiosClient.delete(`/projects/${id}`);
};

export const createProject = async (project: Partial<Project>, files?: File[]): Promise<Project> => {
  const formData = new FormData();
  
  // Create Blob from project JSON so it sets Content-Type application/json for this part correctly.
  formData.append('project', new Blob([JSON.stringify(project)], {
    type: "application/json"
  }));
  
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }

  const response = await axiosClient.post('/projects', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getProjectTasks = async (projectId: number): Promise<Task[]> => {
  const response = await axiosClient.get(`/tasks/project/${projectId}`);
  return response.data;
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  const response = await axiosClient.post('/tasks', task);
  return response.data;
};

export const updateTaskStatus = async (taskId: number, status: string): Promise<Task> => {
  const response = await axiosClient.put(`/tasks/${taskId}/status`, { status });
  return response.data;
};
