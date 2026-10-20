import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tickets' },
      {
        path: 'tickets',
        title: $localize`:@@tickets.list.pageTitle:Tickets`,
        loadComponent: () =>
          import('@pages/tickets/ticket-list/ticket-list.component').then((m) => m.TicketListComponent),
      },
      {
        path: 'tickets/new',
        title: $localize`:@@tickets.create.pageTitle:New ticket`,
        loadComponent: () =>
          import('@pages/tickets/ticket-create/ticket-create.component').then((m) => m.TicketCreateComponent),
      },
      {
        path: 'tickets/:id',
        title: $localize`:@@tickets.detail.pageTitle:Ticket`,
        loadComponent: () =>
          import('@pages/tickets/ticket-detail/ticket-detail.component').then((m) => m.TicketDetailComponent),
      },
      {
        path: '**',
        title: $localize`:@@notFound.page.pageTitle:Page not found`,
        loadComponent: () => import('@pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
