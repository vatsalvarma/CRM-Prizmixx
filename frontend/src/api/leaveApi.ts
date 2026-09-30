import { axiosClient } from './axiosClient';

export interface LeaveBalance {
  id: number;
  leaveTypeId: number;
  leaveTypeName: string;
  balance: number;
}

export interface LeaveRequest {
  id?: number;
  leaveTypeId: number;
  leaveTypeName?: string;
  employeeName?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status?: string;
  approverId?: number;
  approverName?: string;
  rejectionReason?: string;
}

export const getMyBalances = async (): Promise<LeaveBalance[]> => {
  const response = await axiosClient.get('/leave/balances');
  return response.data;
};

export const getMyRequests = async (): Promise<LeaveRequest[]> => {
  const response = await axiosClient.get('/leave/my-requests');
  return response.data;
};

export const getAllPendingRequests = async (): Promise<LeaveRequest[]> => {
  const response = await axiosClient.get('/leave/all-requests');
  return response.data;
};

export const submitLeaveRequest = async (request: LeaveRequest): Promise<LeaveRequest> => {
  const response = await axiosClient.post('/leave/request', request);
  return response.data;
};

export const approveLeaveRequest = async (id: number): Promise<LeaveRequest> => {
  const response = await axiosClient.post(`/leave/${id}/approve`);
  return response.data;
};

export const rejectLeaveRequest = async (id: number, rejectionReason: string): Promise<LeaveRequest> => {
  const response = await axiosClient.post(`/leave/${id}/reject`, { rejectionReason });
  return response.data;
};
