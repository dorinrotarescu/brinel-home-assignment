import { HttpClient, HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '@core/api.constants';
import { Page } from '@shared/_models/page.model';
import {
  AssignTicketRequest,
  CreateTicketRequest,
  TicketDto,
  TicketSearchQuery,
  TicketSummaryDto,
} from '@shared/_models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/tickets`;

  searchResource(query: Signal<TicketSearchQuery>): HttpResourceRef<Page<TicketSummaryDto> | undefined> {
    return httpResource<Page<TicketSummaryDto>>(() => {
      const { criteria, page, size, sort } = query();
      return { url: `${this.url}/search`, method: 'POST', body: criteria, params: { page, size, sort } };
    });
  }

  ticketResource(id: Signal<number>): HttpResourceRef<TicketDto | undefined> {
    return httpResource<TicketDto>(() => `${this.url}/${id()}`);
  }

  create(request: CreateTicketRequest): Observable<TicketDto> {
    return this.http.post<TicketDto>(this.url, request);
  }

  assign(id: number, request: AssignTicketRequest): Observable<TicketDto> {
    return this.http.put<TicketDto>(`${this.url}/${id}/assignee`, request);
  }
}
