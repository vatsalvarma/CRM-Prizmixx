import { axiosClient } from './axiosClient';

export interface ProjectAttachment {
  id: number;
  projectId: number;
  fileName: string;
  fileType: string;
  url: string;
  createdAt: string;
}

export interface StageAssignee {
  id: number;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  departmentName?: string;
  branchName?: string;
}

export interface ProjectStage {
  id: number;
  projectId: number;
  stageName: 'DESIGN' | 'RESOURCES' | 'DEVELOP_TEST' | 'DEPLOY' | string;
  stageOrder: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  title?: string;
  description?: string;
  referenceLinks?: string;
  submissionLink?: string;
  submissionNotes?: string;
  submittedById?: number;
  submittedByName?: string;
  completedAt?: string;
  assignees: StageAssignee[];
  createdAt: string;
  updatedAt: string;
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
  projectType: 'NORMAL' | 'ADVANCED';
  teamLeaderId?: number;
  teamLeaderName?: string;
  currentStage?: 'DESIGN' | 'RESOURCES' | 'DEVELOP_TEST' | 'DEPLOY' | 'COMPLETED' | string;
  stages?: ProjectStage[];
  managerId?: number;
  managerName?: string;
  startDate?: string;
  endDate?: string;
  assignedDepartmentId?: number;
  assignedDepartmentName?: string;
  assignedEmployeeId?: number;
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

export const getProjectStages = async (projectId: number): Promise<ProjectStage[]> => {
  const response = await axiosClient.get(`/projects/${projectId}/stages`);
  return response.data;
};

export const assignTeamLeader = async (projectId: number, teamLeaderId: number): Promise<Project> => {
  const response = await axiosClient.put(`/projects/${projectId}/team-leader`, { teamLeaderId });
  return response.data;
};

export const updateProjectStage = async (
  projectId: number,
  stageName: string,
  data: { description?: string; referenceLinks?: string; assigneeEmployeeIds?: number[] }
): Promise<ProjectStage> => {
  const response = await axiosClient.put(`/projects/${projectId}/stages/${stageName}`, data);
  return response.data;
};

export const submitStageWork = async (
  projectId: number,
  stageName: string,
  data: { submissionLink: string; submissionNotes?: string }
): Promise<ProjectStage> => {
  const response = await axiosClient.post(`/projects/${projectId}/stages/${stageName}/submit`, data);
  return response.data;
};

export const completeStage = async (projectId: number, stageName: string): Promise<ProjectStage> => {
  const response = await axiosClient.post(`/projects/${projectId}/stages/${stageName}/complete`);
  return response.data;
};

export const reopenStage = async (projectId: number, stageName: string): Promise<ProjectStage> => {
  const response = await axiosClient.post(`/projects/${projectId}/stages/${stageName}/reopen`);
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
