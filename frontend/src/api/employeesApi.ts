import { axiosClient } from './axiosClient';

export interface Employee {
  id: number;
  employeeId: string;
  userId: number;
  email: string;
  plainPassword?: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  managerName: string;
  shift: string;
  site: string;
  employmentStatus: string;
  joiningDate: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  departmentId: number;
  manualPassword?: string;
  employmentStatus?: string;
}

export interface CreateEmployeeResponse {
  employeeId: string;
  email: string;
  password: string;
}

export const getAllEmployees = async (): Promise<Employee[]> => {
  const response = await axiosClient.get('/employees');
  return response.data;
};

export const getDepartments = async (): Promise<any[]> => {
  const response = await axiosClient.get('/departments');
  return response.data;
};

export const createEmployee = async (data: CreateEmployeeRequest): Promise<CreateEmployeeResponse> => {
  const response = await axiosClient.post('/employees', data);
  return response.data;
};

export const resetEmployeePassword = async (employeeId: number): Promise<{ newPassword: string }> => {
  const response = await axiosClient.post(`/employees/${employeeId}/reset-password`);
  return response.data;
};

export const deleteEmployee = async (employeeId: number): Promise<void> => {
  await axiosClient.delete(`/employees/${employeeId}`);
};
