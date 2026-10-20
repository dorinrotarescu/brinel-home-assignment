import { DatePipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { StatusChipComponent } from '@shared/_components/status-chip/status-chip.component';
import { TicketService } from '@shared/_services/ticket.service';
import { ticketCategoryLabel, ticketPriorityLabel } from '@shared/_utils/ticket-labels.util';
import { TicketAssignComponent } from './ticket-assign/ticket-assign.component';
import { TicketCommentsComponent } from './ticket-comments/ticket-comments.component';
import { TicketStatusPanelComponent } from './ticket-status-panel/ticket-status-panel.component';

@Component({
  selector: 'app-ticket-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    StatusChipComponent,
    TicketAssignComponent,
    TicketCommentsComponent,
    TicketStatusPanelComponent,
  ],
  templateUrl: './ticket-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetailComponent {
  readonly id = input.required({ transform: numberAttribute });

  protected readonly ticketResource = inject(TicketService).ticketResource(this.id);
  protected readonly notFound = computed(() => {
    const error = this.ticketResource.error();
    return error instanceof HttpErrorResponse && error.status === HttpStatusCode.NotFound;
  });
  protected readonly priorityLabel = ticketPriorityLabel;
  protected readonly categoryLabel = ticketCategoryLabel;
}
