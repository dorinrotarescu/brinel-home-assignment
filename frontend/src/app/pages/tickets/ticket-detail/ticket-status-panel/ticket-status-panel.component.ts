import { DatePipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StatusChipComponent } from '@shared/_components/status-chip/status-chip.component';
import { TicketDto } from '@shared/_models/ticket.model';
import { TicketStatusService } from '@shared/_services/ticket-status.service';
import { ticketStatusLabel } from '@shared/_utils/ticket-labels.util';
import {
  ChangeStatusDialogComponent,
  ChangeStatusDialogData,
} from '../change-status-dialog/change-status-dialog.component';

@Component({
  selector: 'app-ticket-status-panel',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, StatusChipComponent],
  templateUrl: './ticket-status-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketStatusPanelComponent {
  private readonly dialog = inject(MatDialog);

  readonly ticket = input.required<TicketDto>();
  readonly statusChanged = output<void>();

  private readonly ticketId = computed(() => this.ticket().id);

  protected readonly history = inject(TicketStatusService).historyResource(this.ticketId);
  protected readonly unavailable = computed(() => {
    const error = this.history.error();
    return error instanceof HttpErrorResponse && error.status === HttpStatusCode.NotFound;
  });
  protected readonly statusLabel = ticketStatusLabel;

  protected openChangeStatusDialog(): void {
    this.dialog
      .open<ChangeStatusDialogComponent, ChangeStatusDialogData, TicketDto>(ChangeStatusDialogComponent, {
        data: { ticket: this.ticket() },
        width: '32rem',
      })
      .afterClosed()
      .subscribe((ticket) => {
        if (ticket) {
          this.history.reload();
          this.statusChanged.emit();
        }
      });
  }
}
