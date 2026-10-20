import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AssignTicketRequest, CreateTicketRequest, TicketSearchQuery } from '@shared/_models/ticket.model';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  const url = '/api/helpdesk/v1/tickets';
  let service: TicketService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TicketService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('searches with the criteria as POST body and paging and sorting as params', () => {
    const query = signal<TicketSearchQuery>({
      criteria: { status: 'OPEN', priority: 'HIGH', text: 'printer' },
      page: 2,
      size: 25,
      sort: 'createdDate,desc',
    });
    TestBed.runInInjectionContext(() => service.searchResource(query));
    TestBed.tick();

    const request = httpTesting.expectOne(`${url}/search?page=2&size=25&sort=createdDate,desc`).request;

    expect(request.method).toBe('POST');
    expect(request.body).toEqual({ status: 'OPEN', priority: 'HIGH', text: 'printer' });
  });

  it('searches again when the query changes', () => {
    const query = signal<TicketSearchQuery>({ criteria: {}, page: 0, size: 10, sort: 'id,asc' });
    TestBed.runInInjectionContext(() => service.searchResource(query));
    TestBed.tick();
    httpTesting.expectOne(`${url}/search?page=0&size=10&sort=id,asc`);

    query.update((current) => ({ ...current, page: 1 }));
    TestBed.tick();

    httpTesting.expectOne(`${url}/search?page=1&size=10&sort=id,asc`);
  });

  it('loads a ticket by id', () => {
    TestBed.runInInjectionContext(() => service.ticketResource(signal(10)));
    TestBed.tick();

    const request = httpTesting.expectOne(`${url}/10`).request;

    expect(request.method).toBe('GET');
  });

  it('creates a ticket with a POST', () => {
    const body: CreateTicketRequest = {
      title: 'Printer jam',
      description: 'The second floor printer is jammed',
      priority: 'MEDIUM',
      category: 'HARDWARE',
      requesterId: 4,
    };

    service.create(body).subscribe();

    const request = httpTesting.expectOne(url).request;

    expect(request.method).toBe('POST');
    expect(request.body).toEqual(body);
  });

  it('assigns a ticket with a PUT on its assignee', () => {
    const body: AssignTicketRequest = { assigneeId: 2 };

    service.assign(10, body).subscribe();

    const request = httpTesting.expectOne(`${url}/10/assignee`).request;

    expect(request.method).toBe('PUT');
    expect(request.body).toEqual(body);
  });
});
