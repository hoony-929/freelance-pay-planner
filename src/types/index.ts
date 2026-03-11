export type PaymentStatus = 'Unpaid' | 'Invoice Sent' | 'Paid';

export interface User {
  id: string;
  name: string;
  email: string;
  // additional profile details could go here
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  totalFee: number;
  currency: string;
  status: 'Active' | 'Completed' | 'On Hold';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  isCompleted: boolean;

  // Payment tracking specific to tasks (could be milestone based)
  paymentStatus: PaymentStatus;
  paymentDueDate?: string; // ISO string
  paymentAmount?: number;

  createdAt: string;
  updatedAt: string;
}
