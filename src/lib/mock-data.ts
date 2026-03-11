import { User, Client, Project, Task, PaymentStatus } from '../types';

export const mockUser: User = {
  id: 'u-1',
  name: 'Alex Freelance',
  email: 'alex@example.com',
};

export const mockClients: Client[] = [
  { id: 'c-1', name: 'Alice Smith', email: 'alice@techcorp.com', company: 'TechCorp' },
  { id: 'c-2', name: 'Bob Jones', email: 'bob@designstudio.com', company: 'DesignStudio' },
];

export const mockProjects: Project[] = [
  {
    id: 'p-1',
    clientId: 'c-1',
    name: 'Website Redesign',
    totalFee: 5000,
    currency: 'USD',
    status: 'Active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p-2',
    clientId: 'c-2',
    name: 'Brand Identity',
    totalFee: 2500,
    currency: 'USD',
    status: 'Active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const pastDate = new Date(today);
pastDate.setDate(pastDate.getDate() - 2);

export const mockTasks: Task[] = [
  {
    id: 't-1',
    projectId: 'p-1',
    title: 'Wireframes Delivery',
    dueDate: tomorrow.toISOString(),
    isCompleted: false,
    paymentStatus: 'Unpaid',
    paymentDueDate: nextWeek.toISOString(),
    paymentAmount: 1500,
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  },
  {
    id: 't-2',
    projectId: 'p-1',
    title: 'Final Assets Handoff',
    dueDate: nextWeek.toISOString(),
    isCompleted: false,
    paymentStatus: 'Unpaid',
    paymentDueDate: new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    paymentAmount: 3500,
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  },
  {
    id: 't-3',
    projectId: 'p-2',
    title: 'Logo Concepts',
    dueDate: today.toISOString(),
    isCompleted: false,
    paymentStatus: 'Invoice Sent',
    paymentDueDate: tomorrow.toISOString(),
    paymentAmount: 1000,
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  },
  {
    id: 't-4',
    projectId: 'p-2',
    title: 'Initial Discovery Call',
    dueDate: pastDate.toISOString(),
    isCompleted: true,
    paymentStatus: 'Paid',
    paymentDueDate: pastDate.toISOString(),
    paymentAmount: 500,
    createdAt: pastDate.toISOString(),
    updatedAt: pastDate.toISOString(),
  }
];
