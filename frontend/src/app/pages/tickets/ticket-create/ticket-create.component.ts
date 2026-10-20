import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '@core/notification/notification.service';
import {
  CreateTicketRequest,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TicketCategory,
  TicketPriority,
} from '@shared/_models/ticket.model';
import { PersonService } from '@shared/_services/person.service';
import { TicketService } from '@shared/_services/ticket.service';
import { fieldError } from '@shared/_utils/form-errors.util';
import { personLabel, ticketCategoryLabel, ticketPriorityLabel } from '@shared/_utils/ticket-labels.util';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from './ticket-create.config';

@Component({
  selector: 'app-ticket-create',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './ticket-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketCreateComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly personsResource = inject(PersonService).personsResource();

  protected readonly priorities = TICKET_PRIORITIES;
  protected readonly categories = TICKET_CATEGORIES;
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;
  protected readonly fieldError = fieldError;
  protected readonly personLabel = personLabel;
  protected readonly priorityLabel = ticketPriorityLabel;
  protected readonly categoryLabel = ticketCategoryLabel;

  protected readonly persons = computed(() => (this.personsResource.hasValue() ? this.personsResource.value() : []));
  protected readonly submitting = signal(false);

  protected readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(TITLE_MAX_LENGTH)]],
    description: ['', [Validators.required, Validators.maxLength(DESCRIPTION_MAX_LENGTH)]],
    priority: this.formBuilder.control<TicketPriority>('MEDIUM', Validators.required),
    category: this.formBuilder.control<TicketCategory | null>(null, Validators.required),
    requesterId: this.formBuilder.control<number | null>(null, Validators.required),
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const { title, description, priority, category, requesterId } = this.form.getRawValue();
    const request: CreateTicketRequest = {
      title,
      description,
      priority,
      category: category as TicketCategory,
      requesterId: requesterId as number,
    };
    this.submitting.set(true);
    this.ticketService.create(request).subscribe({
      next: (ticket) => {
        this.notificationService.success($localize`:@@tickets.create.success:Ticket #${ticket.id}:id: created`);
        void this.router.navigate(['/tickets', ticket.id]);
      },
      error: () => this.submitting.set(false),
    });
  }
}
