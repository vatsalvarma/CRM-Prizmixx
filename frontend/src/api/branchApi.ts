import { axiosClient } from './axiosClient';
import axios from 'axios';

export interface Branch {
  id: number;
  name: string;
  code: string;
  city?: string;
  isActive: boolean;
  employeeCount?: number;
}

export interface CreateBranchRequest {
  name: string;
  code: string;
  city?: string;
}

// Public — no auth needed, used on login page
export const getPublicBranches = async (): Promise<Branch[]> => {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  const response = await axios.get(`${base}/branches/public`);
  return response.data;
};

// Admin — requires auth
export const getAllBranches = async (): Promise<Branch[]> => {
  const response = await axiosClient.get('/branches');
  return response.data;
};

export const createBranch = async (data: CreateBranchRequest): Promise<Branch> => {
  const response = await axiosClient.post('/branches', data);
  return response.data;
};

export const updateBranch = async (id: number, data: CreateBranchRequest): Promise<Branch> => {
  const response = await axiosClient.put(`/branches/${id}`, data);
  return response.data;
};

export const toggleBranchStatus = async (id: number): Promise<void> => {
  await axiosClient.patch(`/branches/${id}/toggle`);
};
