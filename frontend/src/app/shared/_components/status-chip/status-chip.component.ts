import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TicketStatus } from '@shared/_models/ticket.model';
import { ticketStatusChipClasses, ticketStatusLabel } from '@shared/_utils/ticket-labels.util';

@Component({
  selector: 'app-status-chip',
  template: `
    <span class="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium" [class]="classes()">
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  readonly status = input.required<TicketStatus>();

  protected readonly label = computed(() => ticketStatusLabel(this.status()));
  protected readonly classes = computed(() => ticketStatusChipClasses(this.status()));
}
