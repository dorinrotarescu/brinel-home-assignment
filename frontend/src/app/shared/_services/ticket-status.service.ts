import { HttpClient, HttpContext, HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '@core/api.constants';
import { SILENT_ERRORS } from '@core/http/http-context.tokens';
import { ChangeTicketStatusRequest, TicketStatusHistoryDto } from '@shared/_models/ticket-status.model';
import { TicketDto } from '@shared/_models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketStatusService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/tickets`;

  historyResource(ticketId: Signal<number>): HttpResourceRef<TicketStatusHistoryDto[] | undefined> {
    return httpResource<TicketStatusHistoryDto[]>(() => ({
      url: `${this.url}/${ticketId()}/history`,
      context: new HttpContext().set(SILENT_ERRORS, true),
    }));
  }

  changeStatus(ticketId: number, request: ChangeTicketStatusRequest): Observable<TicketDto> {
    return this.http.put<TicketDto>(`${this.url}/${ticketId}/status`, request);
  }
}
