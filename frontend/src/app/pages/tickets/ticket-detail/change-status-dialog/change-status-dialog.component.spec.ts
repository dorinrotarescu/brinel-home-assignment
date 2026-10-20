import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NotificationService } from '@core/notification/notification.service';
import { TicketDto } from '@shared/_models/ticket.model';
import { PersonService } from '@shared/_services/person.service';
import { TicketStatusService } from '@shared/_services/ticket-status.service';
import { ChangeStatusDialogComponent } from './change-status-dialog.component';

describe('ChangeStatusDialogComponent', () => {
  const ticket: TicketDto = {
    id: 10,
    title: 'Cannot connect to office Wi-Fi',
    description: 'Since this morning my laptop cannot join the office network.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    category: 'NETWORK',
    requester: { id: 5, fullName: 'Omar Haddad', email: 'omar.haddad@acme.example', role: 'EMPLOYEE' },
    assignee: { id: 2, fullName: 'Priya Nair', email: 'priya.nair@acme.example', role: 'AGENT' },
    createdDate: '2026-09-03T09:12:00',
    updatedDate: '2026-09-03T10:05:00',
  };
  let component: ChangeStatusDialogComponent;
  let ticketStatusService: { changeStatus: ReturnType<typeof vi.fn> };
  let notification: { success: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    ticketStatusService = { changeStatus: vi.fn().mockReturnValue(of({ ...ticket, status: 'RESOLVED' })) };
    notification = { success: vi.fn() };
    dialogRef = { close: vi.fn() };
    TestBed.configureTestingModule({
      imports: [ChangeStatusDialogComponent],
      providers: [
        { provide: TicketStatusService, useValue: ticketStatusService },
        { provide: NotificationService, useValue: notification },
        { provide: PersonService, useValue: { personsResource: () => ({ hasValue: () => false }) } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ticket } },
      ],
    });
    TestBed.overrideComponent(ChangeStatusDialogComponent, { set: { template: '' } });
    component = TestBed.createComponent(ChangeStatusDialogComponent).componentInstance;
  });

  it('offers every status except the current one', () => {
    expect(component['statusOptions']).toEqual(['OPEN', 'ON_HOLD', 'RESOLVED', 'CLOSED']);
  });

  it('sends the request with the trimmed comment and closes with the updated ticket', () => {
    component['form'].setValue({ status: 'RESOLVED', changedById: 2, comment: '  Replaced the network cable.  ' });

    component['submit']();

    expect(ticketStatusService.changeStatus).toHaveBeenCalledExactlyOnceWith(10, {
      status: 'RESOLVED',
      changedById: 2,
      comment: 'Replaced the network cable.',
    });
    expect(notification.success).toHaveBeenCalledExactlyOnceWith('Status changed to Resolved');
    expect(dialogRef.close).toHaveBeenCalledExactlyOnceWith({ ...ticket, status: 'RESOLVED' });
  });

  it('sends a null comment when the comment is blank', () => {
    component['form'].setValue({ status: 'OPEN', changedById: 2, comment: '   ' });

    component['submit']();

    expect(ticketStatusService.changeStatus).toHaveBeenCalledExactlyOnceWith(10, {
      status: 'OPEN',
      changedById: 2,
      comment: null,
    });
  });

  it('does not submit an invalid form', () => {
    component['form'].setValue({ status: null, changedById: 2, comment: '' });

    component['submit']();

    expect(component['form'].controls.status.touched).toBe(true);
    expect(ticketStatusService.changeStatus).not.toHaveBeenCalled();
  });

  it('does not submit a comment longer than the maximum', () => {
    component['form'].setValue({ status: 'ON_HOLD', changedById: 2, comment: 'a'.repeat(1001) });

    component['submit']();

    expect(ticketStatusService.changeStatus).not.toHaveBeenCalled();
  });

  it('stays open and can be submitted again when the change fails', () => {
    ticketStatusService.changeStatus.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component['form'].setValue({ status: 'CLOSED', changedById: 2, comment: '' });

    component['submit']();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(notification.success).not.toHaveBeenCalled();
    expect(component['submitting']()).toBe(false);
  });
});
