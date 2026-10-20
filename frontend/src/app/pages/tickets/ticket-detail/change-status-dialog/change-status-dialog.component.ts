import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '@core/notification/notification.service';
import { StatusChipComponent } from '@shared/_components/status-chip/status-chip.component';
import { TICKET_STATUSES, TicketDto, TicketStatus } from '@shared/_models/ticket.model';
import { PersonService } from '@shared/_services/person.service';
import { TicketStatusService } from '@shared/_services/ticket-status.service';
import { fieldError } from '@shared/_utils/form-errors.util';
import { personLabel, ticketStatusLabel } from '@shared/_utils/ticket-labels.util';
import { STATUS_COMMENT_MAX_LENGTH } from '../ticket-detail.config';

export interface ChangeStatusDialogData {
  ticket: TicketDto;
}

@Component({
  selector: 'app-change-status-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    StatusChipComponent,
  ],
  templateUrl: './change-status-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeStatusDialogComponent {
  private readonly ticketStatusService = inject(TicketStatusService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject<MatDialogRef<ChangeStatusDialogComponent, TicketDto>>(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly ticket = inject<ChangeStatusDialogData>(MAT_DIALOG_DATA).ticket;
  protected readonly statusOptions = TICKET_STATUSES.filter((status) => status !== this.ticket.status);
  protected readonly people = inject(PersonService).personsResource();
  protected readonly peopleOptions = computed(() => (this.people.hasValue() ? this.people.value() : []));
  protected readonly submitting = signal(false);
  protected readonly maxLength = STATUS_COMMENT_MAX_LENGTH;
  protected readonly fieldError = fieldError;
  protected readonly personLabel = personLabel;
  protected readonly statusLabel = ticketStatusLabel;

  protected readonly form = this.fb.group({
    status: this.fb.control<TicketStatus | null>(null, Validators.required),
    changedById: this.fb.control<number | null>(null, Validators.required),
    comment: this.fb.control('', Validators.maxLength(STATUS_COMMENT_MAX_LENGTH)),
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    const { status, changedById, comment } = this.form.getRawValue();
    if (this.form.invalid || status === null || changedById === null) {
      return;
    }
    this.submitting.set(true);
    this.ticketStatusService
      .changeStatus(this.ticket.id, { status, changedById, comment: comment.trim() || null })
      .subscribe({
        next: (ticket) => {
          this.notification.success(
            $localize`:@@tickets.changeStatus.success:Status changed to ${ticketStatusLabel(ticket.status)}:status:`
          );
          this.dialogRef.close(ticket);
        },
        error: () => this.submitting.set(false),
      });
  }
}
