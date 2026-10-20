import { PersonDto } from './person.model';
import { TicketStatus } from './ticket.model';

export interface ChangeTicketStatusRequest {
  status: TicketStatus;
  changedById: number;
  comment: string | null;
}

export interface TicketStatusHistoryDto {
  id: number;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus;
  comment: string | null;
  changedBy: PersonDto;
  changedDate: string;
}
