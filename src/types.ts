export type OrderStatus = "Pending" | "Processing" | "Completed" | "Canceled" | "Refunded";
export type TicketStatus = "Open" | "Answered" | "Closed";
export type TicketCategory = "Order" | "Payment" | "Service" | "Other";

export interface Service {
  id: string;
  name: string;
  category: string;
  rate: number; // Price per 1000
  min: number;
  max: number;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  category: string;
  link: string;
  quantity: number;
  charge: number;
  status: OrderStatus;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  totalSpent: number;
  role: "user" | "admin";
  status: "active" | "suspended";
  password?: string;
}

export interface TicketMessage {
  sender: "user" | "admin";
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  messages: TicketMessage[];
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  status: "Completed" | "Pending" | "Failed";
  createdAt: string;
  senderNumber?: string;
  trxId?: string;
  adminNotes?: string;
}
