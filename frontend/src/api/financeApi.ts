import { axiosClient } from './axiosClient';

export interface Invoice {
  id: number;
  clientId: number;
  clientName: string;
  projectId?: number;
  projectName?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  totalAmount: number;
  status: string; // DRAFT, ISSUED, PARTIALLY_PAID, PAID, CANCELLED, OVERDUE
  createdAt: string;
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  status: string;
  createdAt: string;
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await axiosClient.get('/invoices');
  return response.data;
};

export const getInvoice = async (id: number): Promise<Invoice> => {
  const response = await axiosClient.get(`/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (invoice: Partial<Invoice>): Promise<Invoice> => {
  const response = await axiosClient.post('/invoices', invoice);
  return response.data;
};

export const getInvoicePayments = async (invoiceId: number): Promise<Payment[]> => {
  const response = await axiosClient.get(`/invoices/${invoiceId}/payments`);
  return response.data;
};

export const addPayment = async (invoiceId: number, payment: Partial<Payment>): Promise<Payment> => {
  const response = await axiosClient.post(`/invoices/${invoiceId}/payments`, payment);
  return response.data;
};
