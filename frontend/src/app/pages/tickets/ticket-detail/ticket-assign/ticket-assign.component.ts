import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '@core/notification/notification.service';
import { TicketDto } from '@shared/_models/ticket.model';
import { PersonService } from '@shared/_services/person.service';
import { TicketService } from '@shared/_services/ticket.service';
import { fieldError } from '@shared/_utils/form-errors.util';

@Component({
  selector: 'app-ticket-assign',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './ticket-assign.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketAssignComponent {
  private readonly ticketService = inject(TicketService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly ticket = input.required<TicketDto>();
  readonly assigned = output<void>();

  protected readonly agents = inject(PersonService).personsResource('AGENT');
  protected readonly agentOptions = computed(() => (this.agents.hasValue() ? this.agents.value() : []));
  protected readonly submitting = signal(false);
  protected readonly fieldError = fieldError;

  protected readonly form = this.fb.group({
    assigneeId: this.fb.control<number | null>(null, Validators.required),
  });

  constructor() {
    effect(() => this.form.reset({ assigneeId: this.ticket().assignee?.id ?? null }));
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    const { assigneeId } = this.form.getRawValue();
    if (this.form.invalid || assigneeId === null) {
      return;
    }
    this.submitting.set(true);
    this.ticketService.assign(this.ticket().id, { assigneeId }).subscribe({
      next: (ticket) => {
        this.submitting.set(false);
        this.notification.success(
          $localize`:@@tickets.assign.success:Ticket assigned to ${ticket.assignee?.fullName}:name:`
        );
        this.assigned.emit();
      },
      error: () => this.submitting.set(false),
    });
  }
}
