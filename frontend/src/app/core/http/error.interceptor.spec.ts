import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/notification/notification.service';
import { errorInterceptor } from './error.interceptor';
import { SILENT_ERRORS } from './http-context.tokens';

describe('errorInterceptor', () => {
  const url = '/api/helpdesk/v1/tickets';
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let notification: { error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    notification = { error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notification },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  function request(context?: HttpContext): { error: unknown } {
    const result: { error: unknown } = { error: undefined };
    http.get(url, { context }).subscribe({ error: (error: unknown) => (result.error = error) });
    return result;
  }

  it('shows the detail of the error body and rethrows', () => {
    const result = request();

    httpTesting
      .expectOne(url)
      .flush(
        { status: 409, detail: 'Ticket 10 is closed and cannot be reassigned' },
        { status: 409, statusText: 'Conflict' }
      );

    expect(notification.error).toHaveBeenCalledExactlyOnceWith('Ticket 10 is closed and cannot be reassigned');
    expect(result.error).toBeDefined();
  });

  it('shows the first field error of a validation error', () => {
    request();

    httpTesting.expectOne(url).flush(
      {
        status: 400,
        detail: 'Validation failed',
        errors: [
          { field: 'title', message: 'Title is required' },
          { field: 'priority', message: 'Priority is required' },
        ],
      },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(notification.error).toHaveBeenCalledExactlyOnceWith('Title is required');
  });

  it('does not notify for silent requests but still rethrows', () => {
    const result = request(new HttpContext().set(SILENT_ERRORS, true));

    httpTesting.expectOne(url).flush({ status: 404, detail: 'Not found' }, { status: 404, statusText: 'Not Found' });

    expect(notification.error).not.toHaveBeenCalled();
    expect(result.error).toBeDefined();
  });

  it('shows a server unreachable message for status 0', () => {
    request();

    httpTesting.expectOne(url).error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(notification.error).toHaveBeenCalledExactlyOnceWith('Cannot reach the server. Is the backend running?');
  });

  it('shows a server unreachable message when the dev proxy answers 502', () => {
    request();

    httpTesting.expectOne(url).flush('', { status: 502, statusText: 'Bad Gateway' });

    expect(notification.error).toHaveBeenCalledExactlyOnceWith('Cannot reach the server. Is the backend running?');
  });

  it('falls back to a not found message for a 404 without detail', () => {
    request();

    httpTesting.expectOne(url).flush(null, { status: 404, statusText: 'Not Found' });

    expect(notification.error).toHaveBeenCalledExactlyOnceWith('Not found');
  });

  it('falls back to a server error message for a 5xx without detail', () => {
    request();

    httpTesting.expectOne(url).flush(null, { status: 503, statusText: 'Service Unavailable' });

    expect(notification.error).toHaveBeenCalledExactlyOnceWith('Something went wrong on the server');
  });
});
