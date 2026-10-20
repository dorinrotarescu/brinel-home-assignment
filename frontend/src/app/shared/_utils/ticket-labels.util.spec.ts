import { PERSON_ROLES, PersonDto } from '@shared/_models/person.model';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '@shared/_models/ticket.model';
import {
  personLabel,
  personRoleLabel,
  ticketCategoryLabel,
  ticketPriorityLabel,
  ticketStatusChipClasses,
  ticketStatusLabel,
} from './ticket-labels.util';

describe('ticket labels', () => {
  it.each(TICKET_STATUSES)('has a label and chip colour classes for status %s', (status) => {
    expect(ticketStatusLabel(status)).toBeTruthy();
    expect(ticketStatusChipClasses(status)).toMatch(/^bg-\S+ text-\S+$/);
  });

  it('gives every status its own label and colour', () => {
    expect(new Set(TICKET_STATUSES.map(ticketStatusLabel)).size).toBe(TICKET_STATUSES.length);
    expect(new Set(TICKET_STATUSES.map(ticketStatusChipClasses)).size).toBe(TICKET_STATUSES.length);
  });

  it.each(TICKET_PRIORITIES)('has a label for priority %s', (priority) => {
    expect(ticketPriorityLabel(priority)).toBeTruthy();
  });

  it.each(TICKET_CATEGORIES)('has a label for category %s', (category) => {
    expect(ticketCategoryLabel(category)).toBeTruthy();
  });

  it.each(PERSON_ROLES)('has a label for role %s', (role) => {
    expect(personRoleLabel(role)).toBeTruthy();
  });

  it('labels a person with their name and role', () => {
    const person: PersonDto = { id: 1, fullName: 'Alice Martin', email: 'alice.martin@acme.example', role: 'AGENT' };

    expect(personLabel(person)).toBe('Alice Martin (Agent)');
  });
});
