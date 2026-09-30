import { axiosClient } from './axiosClient';

export interface Lead {
  id: number;
  clientCompany: string;
  contactName: string;
  phone: string;
  email: string;
  source: string;
  requiredService: string;
  commercialRange: string;
  expectedDecision: string;
  status: string;
  lostReason?: string;
  ownerId?: number;
  ownerName?: string;
  ownerDepartment?: string;
  projectName?: string;
  description?: string;
  referenceLinks?: string;
  documentUrl?: string;
  nextAction?: string;
  dueDate?: string;
  createdAt: string;
}

export interface LeadActivity {
  id: number;
  leadId: number;
  employeeId: number;
  employeeName: string;
  activityType: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';
  description: string;
  createdAt: string;
}

export interface ClientContact {
  id: number;
  clientId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface Client {
  id: number;
  companyName: string;
  industry: string;
  website: string;
  status: string;
  ownerId?: number;
  ownerName?: string;
  contacts: ClientContact[];
}

export const getLeads = async (): Promise<Lead[]> => {
  const response = await axiosClient.get('/leads');
  return response.data;
};

export const getLead = async (id: number): Promise<Lead> => {
  const response = await axiosClient.get(`/leads/${id}`);
  return response.data;
};

export const createLead = async (lead: Partial<Lead>): Promise<Lead> => {
  const response = await axiosClient.post('/leads', lead);
  return response.data;
};

export const updateLeadStatus = async (id: number, status: string): Promise<Lead> => {
  const response = await axiosClient.put(`/leads/${id}/status`, { status });
  return response.data;
};

export const getLeadActivities = async (id: number): Promise<LeadActivity[]> => {
  const response = await axiosClient.get(`/leads/${id}/activities`);
  return response.data;
};

export const addLeadActivity = async (id: number, activity: Partial<LeadActivity>): Promise<LeadActivity> => {
  const response = await axiosClient.post(`/leads/${id}/activities`, activity);
  return response.data;
};

export const getClients = async (): Promise<Client[]> => {
  const response = await axiosClient.get('/clients');
  return response.data;
};
