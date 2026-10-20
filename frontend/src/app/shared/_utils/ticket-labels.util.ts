import { PersonDto, PersonRole } from '@shared/_models/person.model';
import { TicketCategory, TicketPriority, TicketStatus } from '@shared/_models/ticket.model';

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: $localize`:@@shared.labels.status.open:Open`,
  IN_PROGRESS: $localize`:@@shared.labels.status.inProgress:In progress`,
  ON_HOLD: $localize`:@@shared.labels.status.onHold:On hold`,
  RESOLVED: $localize`:@@shared.labels.status.resolved:Resolved`,
  CLOSED: $localize`:@@shared.labels.status.closed:Closed`,
};

export const TICKET_STATUS_CHIP_CLASSES: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  ON_HOLD: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-200 text-gray-800',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: $localize`:@@shared.labels.priority.low:Low`,
  MEDIUM: $localize`:@@shared.labels.priority.medium:Medium`,
  HIGH: $localize`:@@shared.labels.priority.high:High`,
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  HARDWARE: $localize`:@@shared.labels.category.hardware:Hardware`,
  SOFTWARE: $localize`:@@shared.labels.category.software:Software`,
  NETWORK: $localize`:@@shared.labels.category.network:Network`,
  ACCOUNT_ACCESS: $localize`:@@shared.labels.category.accountAccess:Account access`,
  OTHER: $localize`:@@shared.labels.category.other:Other`,
};

export const PERSON_ROLE_LABELS: Record<PersonRole, string> = {
  AGENT: $localize`:@@shared.labels.role.agent:Agent`,
  EMPLOYEE: $localize`:@@shared.labels.role.employee:Employee`,
};

export function ticketStatusLabel(status: TicketStatus): string {
  return TICKET_STATUS_LABELS[status];
}

export function ticketStatusChipClasses(status: TicketStatus): string {
  return TICKET_STATUS_CHIP_CLASSES[status];
}

export function ticketPriorityLabel(priority: TicketPriority): string {
  return TICKET_PRIORITY_LABELS[priority];
}

export function ticketCategoryLabel(category: TicketCategory): string {
  return TICKET_CATEGORY_LABELS[category];
}

export function personRoleLabel(role: PersonRole): string {
  return PERSON_ROLE_LABELS[role];
}

export function personLabel(person: PersonDto): string {
  return $localize`:@@shared.labels.person:${person.fullName}:name: (${personRoleLabel(person.role)}:role:)`;
}
