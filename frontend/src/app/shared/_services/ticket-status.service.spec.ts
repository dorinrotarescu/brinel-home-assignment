import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SILENT_ERRORS } from '@core/http/http-context.tokens';
import { ChangeTicketStatusRequest } from '@shared/_models/ticket-status.model';
import { TicketStatusService } from './ticket-status.service';

describe('TicketStatusService', () => {
  const url = '/api/helpdesk/v1/tickets';
  let service: TicketStatusService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TicketStatusService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('changes the status with a PUT on the ticket status', () => {
    const body: ChangeTicketStatusRequest = {
      status: 'RESOLVED',
      changedById: 2,
      comment: 'Replaced the network cable.',
    };

    service.changeStatus(10, body).subscribe();

    const request = httpTesting.expectOne(`${url}/10/status`).request;

    expect(request.method).toBe('PUT');
    expect(request.body).toEqual({ status: 'RESOLVED', changedById: 2, comment: 'Replaced the network cable.' });
  });

  it('sends a null comment when there is none', () => {
    service.changeStatus(10, { status: 'IN_PROGRESS', changedById: 1, comment: null }).subscribe();

    const request = httpTesting.expectOne(`${url}/10/status`).request;

    expect(request.body).toEqual({ status: 'IN_PROGRESS', changedById: 1, comment: null });
  });

  it('loads the status history of a ticket without the error notification', () => {
    TestBed.runInInjectionContext(() => service.historyResource(signal(10)));
    TestBed.tick();

    const request = httpTesting.expectOne(`${url}/10/history`).request;

    expect(request.method).toBe('GET');
    expect(request.context.get(SILENT_ERRORS)).toBe(true);
  });

  it('loads the history again when the ticket id changes', () => {
    const ticketId = signal(10);
    TestBed.runInInjectionContext(() => service.historyResource(ticketId));
    TestBed.tick();
    httpTesting.expectOne(`${url}/10/history`);

    ticketId.set(11);
    TestBed.tick();

    httpTesting.expectOne(`${url}/11/history`);
  });
});
