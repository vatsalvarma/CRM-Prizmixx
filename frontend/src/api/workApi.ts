import { axiosClient as api } from './axiosClient';

export interface Work {
  id: number;
  name: string;
  description: string;
  referenceLinks: string;
  documentPdf: string;
  departmentId: number;
  departmentName: string;
  assignedEmployeeId: number;
  assignedEmployeeName: string;
  assignedDate: string;
  completed: boolean;
}

export interface CreateWorkRequest {
  name: string;
  description: string;
  referenceLinks: string;
  documentPdf: string;
  departmentId: number;
  assignedEmployeeId: number;
}

export const createWork = async (request: CreateWorkRequest): Promise<Work> => {
  const response = await api.post('/works', request);
  return response.data;
};

export const getAllWorks = async (): Promise<Work[]> => {
  const response = await api.get('/works');
  return response.data;
};

export const getWorksByEmployee = async (employeeId: number): Promise<Work[]> => {
  const response = await api.get(`/works/employee/${employeeId}`);
  return response.data;
};

export const markWorkAsComplete = async (id: number): Promise<Work> => {
  const response = await api.put(`/works/${id}/complete`);
  return response.data;
};
