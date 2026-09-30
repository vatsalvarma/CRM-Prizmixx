import { axiosClient } from './axiosClient';

export interface SupportTicket {
  id: number;
  clientId: number;
  clientName: string;
  subject: string;
  description: string;
  priority: string; // LOW, MEDIUM, HIGH, URGENT
  status: string; // OPEN, IN_PROGRESS, WAITING_ON_CLIENT, RESOLVED, CLOSED
  assigneeId?: number;
  assigneeName?: string;
  slaDueTime?: string;
  escalationLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
}

export const getTickets = async (): Promise<SupportTicket[]> => {
  const response = await axiosClient.get('/tickets');
  return response.data;
};

export const getTicket = async (id: number): Promise<SupportTicket> => {
  const response = await axiosClient.get(`/tickets/${id}`);
  return response.data;
};

export const createTicket = async (ticket: Partial<SupportTicket>): Promise<SupportTicket> => {
  const response = await axiosClient.post('/tickets', ticket);
  return response.data;
};

export const updateTicketStatus = async (ticketId: number, status: string): Promise<SupportTicket> => {
  const response = await axiosClient.put(`/tickets/${ticketId}/status`, { status });
  return response.data;
};

export const getTicketComments = async (ticketId: number): Promise<TicketComment[]> => {
  const response = await axiosClient.get(`/tickets/${ticketId}/comments`);
  return response.data;
};

export const addTicketComment = async (ticketId: number, comment: Partial<TicketComment>): Promise<TicketComment> => {
  const response = await axiosClient.post(`/tickets/${ticketId}/comments`, comment);
  return response.data;
};
