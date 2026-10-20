import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { StatusChipComponent } from '@shared/_components/status-chip/status-chip.component';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TicketPriority,
  TicketSearchCriteria,
  TicketSearchQuery,
  TicketStatus,
} from '@shared/_models/ticket.model';
import { TicketService } from '@shared/_services/ticket.service';
import { fieldError } from '@shared/_utils/form-errors.util';
import { ticketCategoryLabel, ticketPriorityLabel, ticketStatusLabel } from '@shared/_utils/ticket-labels.util';
import {
  TICKET_LIST_COLUMNS,
  TICKET_LIST_DEFAULT_SORT,
  TICKET_LIST_PAGE_SIZE,
  TICKET_LIST_PAGE_SIZE_OPTIONS,
  TICKET_LIST_TEXT_MAX_LENGTH,
} from './ticket-list.config';

@Component({
  selector: 'app-ticket-list',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    StatusChipComponent,
  ],
  templateUrl: './ticket-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketListComponent {
  private readonly ticketService = inject(TicketService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly columns = TICKET_LIST_COLUMNS;
  protected readonly pageSizeOptions = TICKET_LIST_PAGE_SIZE_OPTIONS;
  protected readonly statuses = TICKET_STATUSES;
  protected readonly priorities = TICKET_PRIORITIES;
  protected readonly statusLabel = ticketStatusLabel;
  protected readonly priorityLabel = ticketPriorityLabel;
  protected readonly categoryLabel = ticketCategoryLabel;
  protected readonly fieldError = fieldError;

  protected readonly form = this.fb.group({
    status: this.fb.control<TicketStatus | null>(null),
    priority: this.fb.control<TicketPriority | null>(null),
    text: ['', Validators.maxLength(TICKET_LIST_TEXT_MAX_LENGTH)],
  });

  protected readonly query = signal<TicketSearchQuery>({
    criteria: {},
    page: 0,
    size: TICKET_LIST_PAGE_SIZE,
    sort: TICKET_LIST_DEFAULT_SORT,
  });

  protected readonly ticketsResource = this.ticketService.searchResource(this.query);

  private readonly result = computed(() =>
    this.ticketsResource.hasValue() ? this.ticketsResource.value() : undefined
  );
  protected readonly tickets = computed(() => this.result()?.content ?? []);
  protected readonly totalElements = computed(() => this.result()?.page.totalElements ?? 0);
  protected readonly isEmpty = computed(() => this.result()?.content.length === 0);
  protected readonly sortActive = computed(() => this.query().sort.split(',')[0]);
  protected readonly sortDirection = computed(() => this.query().sort.split(',')[1] as SortDirection);

  protected search(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const { status, priority, text } = this.form.getRawValue();
    const trimmedText = text.trim();
    const criteria: TicketSearchCriteria = {};
    if (status) {
      criteria.status = status;
    }
    if (priority) {
      criteria.priority = priority;
    }
    if (trimmedText) {
      criteria.text = trimmedText;
    }
    this.query.update((query) => ({ ...query, criteria, page: 0 }));
  }

  protected onSortChange({ active, direction }: Sort): void {
    const sort = direction ? `${active},${direction}` : TICKET_LIST_DEFAULT_SORT;
    this.query.update((query) => ({ ...query, sort, page: 0 }));
  }

  protected onPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.query.update((query) => ({ ...query, page: pageIndex, size: pageSize }));
  }
}
