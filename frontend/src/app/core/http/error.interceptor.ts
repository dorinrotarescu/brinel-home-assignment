import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/notification/notification.service';
import { SILENT_ERRORS } from './http-context.tokens';

// The dev server proxy answers 502 or 504 when the backend is not running.
const UNREACHABLE_STATUSES: number[] = [0, HttpStatusCode.BadGateway, HttpStatusCode.GatewayTimeout];

interface ErrorBody {
  detail?: string;
  errors?: { field: string; message: string }[];
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SILENT_ERRORS)) {
    return next(req);
  }
  const notification = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notification.error(errorMessage(error));
      return throwError(() => error);
    })
  );
};

function errorMessage(error: HttpErrorResponse): string {
  const body: ErrorBody | null = typeof error.error === 'object' ? error.error : null;
  const firstFieldError = body?.errors?.[0]?.message;
  if (error.status === HttpStatusCode.BadRequest && firstFieldError) {
    return firstFieldError;
  }
  if (body?.detail) {
    return body.detail;
  }
  if (UNREACHABLE_STATUSES.includes(error.status)) {
    return $localize`:@@core.errors.serverUnreachable:Cannot reach the server. Is the backend running?`;
  }
  if (error.status === HttpStatusCode.NotFound) {
    return $localize`:@@core.errors.notFound:Not found`;
  }
  if (error.status >= HttpStatusCode.InternalServerError) {
    return $localize`:@@core.errors.serverError:Something went wrong on the server`;
  }
  return error.message;
}
