import { axiosClient } from './axiosClient';

export interface ApprovalRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  approverId: number;
  approverName: string;
  entityType: string;
  entityId: number;
  status: string; // PENDING, APPROVED, REJECTED, MORE_INFO_NEEDED
  requestNote: string;
  responseNote: string;
  createdAt: string;
  updatedAt: string;
}

export const getPendingApprovals = async (approverId: number): Promise<ApprovalRequest[]> => {
  const response = await axiosClient.get(`/approvals/pending/${approverId}`);
  return response.data;
};

export const getAllApprovals = async (): Promise<ApprovalRequest[]> => {
  const response = await axiosClient.get('/approvals/all');
  return response.data;
};

export const submitApprovalDecision = async (id: number, status: string, responseNote?: string): Promise<ApprovalRequest> => {
  const response = await axiosClient.post(`/approvals/${id}/decision`, {
    status,
    responseNote
  });
  return response.data;
};
