import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormGroupDirective, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '@core/notification/notification.service';
import { CommentService } from '@shared/_services/comment.service';
import { PersonService } from '@shared/_services/person.service';
import { fieldError } from '@shared/_utils/form-errors.util';
import { personLabel } from '@shared/_utils/ticket-labels.util';
import { COMMENT_MAX_LENGTH } from '../ticket-detail.config';

@Component({
  selector: 'app-ticket-comments',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './ticket-comments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketCommentsComponent {
  private readonly commentService = inject(CommentService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly formDirective = viewChild.required(FormGroupDirective);

  readonly ticketId = input.required<number>();

  protected readonly comments = this.commentService.commentsResource(this.ticketId);
  protected readonly people = inject(PersonService).personsResource();
  protected readonly peopleOptions = computed(() => (this.people.hasValue() ? this.people.value() : []));
  protected readonly submitting = signal(false);
  protected readonly maxLength = COMMENT_MAX_LENGTH;
  protected readonly fieldError = fieldError;
  protected readonly personLabel = personLabel;

  protected readonly form = this.fb.group({
    authorId: this.fb.control<number | null>(null, Validators.required),
    content: this.fb.control('', [Validators.required, Validators.maxLength(COMMENT_MAX_LENGTH)]),
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    const { authorId, content } = this.form.getRawValue();
    if (this.form.invalid || authorId === null) {
      return;
    }
    this.submitting.set(true);
    this.commentService.add(this.ticketId(), { authorId, content }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notification.success($localize`:@@tickets.comments.added:Comment added`);
        this.formDirective().resetForm();
        this.comments.reload();
      },
      error: () => this.submitting.set(false),
    });
  }
}
