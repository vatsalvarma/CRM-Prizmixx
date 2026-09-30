import { axiosClient } from './axiosClient';

export interface Employee {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  departmentName: string | null;
  managerId: number | null;
  managerName: string | null;
  shift: string;
  site: string;
  employmentStatus: string;
  joiningDate: string;
}

export const getMyProfile = async (): Promise<Employee> => {
  const response = await axiosClient.get('/employees/me');
  return response.data;
};

export const getAllEmployees = async (): Promise<Employee[]> => {
  const response = await axiosClient.get('/employees');
  return response.data;
};
