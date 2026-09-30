import { axiosClient } from '../../api/axiosClient';

export interface HRDocument {
  id: number;
  documentName: string;
  documentType: string;
  status: string;
  fileUrl?: string;
  updatedAt: string;
}

export interface HRLead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: number;
  departmentName?: string;
  position?: string;
  status: string;
  documents: HRDocument[];
  createdAt: string;
}

export const getHRLeads = async (): Promise<HRLead[]> => {
  const response = await axiosClient.get('/hr/leads');
  return response.data;
};

export const createHRLead = async (leadData: Partial<HRLead>): Promise<HRLead> => {
  const response = await axiosClient.post('/hr/leads', leadData);
  return response.data;
};

export const updateDocumentStatus = async (documentId: number, status: string): Promise<HRDocument> => {
  const response = await axiosClient.put(`/hr/documents/${documentId}/status`, { status });
  return response.data;
};

export const updateLeadStatus = async (leadId: number, status: string): Promise<HRLead> => {
  const response = await axiosClient.put(`/hr/leads/${leadId}/status`, { status });
  return response.data;
};

export const uploadDocument = async (documentId: number, file: File): Promise<HRDocument> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post(`/hr/documents/${documentId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
