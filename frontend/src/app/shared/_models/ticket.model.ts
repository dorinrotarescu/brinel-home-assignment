import { PersonDto } from './person.model';

export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCOUNT_ACCESS', 'OTHER'] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export interface TicketDto {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requester: PersonDto;
  assignee: PersonDto | null;
  createdDate: string;
  updatedDate: string;
}

export interface TicketSummaryDto {
  id: number;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requesterName: string;
  assigneeName: string | null;
  createdDate: string;
}

export interface TicketSearchCriteria {
  status?: TicketStatus;
  priority?: TicketPriority;
  text?: string;
}

export interface TicketSearchQuery {
  criteria: TicketSearchCriteria;
  page: number;
  size: number;
  sort: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  requesterId: number;
}

export interface AssignTicketRequest {
  assigneeId: number;
}
