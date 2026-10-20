import { HttpClient, HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '@core/api.constants';
import { CommentDto, CreateCommentRequest } from '@shared/_models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);

  commentsResource(ticketId: Signal<number>): HttpResourceRef<CommentDto[] | undefined> {
    return httpResource<CommentDto[]>(() => this.url(ticketId()));
  }

  add(ticketId: number, request: CreateCommentRequest): Observable<CommentDto> {
    return this.http.post<CommentDto>(this.url(ticketId), request);
  }

  private url(ticketId: number): string {
    return `${API_BASE}/tickets/${ticketId}/comments`;
  }
}
