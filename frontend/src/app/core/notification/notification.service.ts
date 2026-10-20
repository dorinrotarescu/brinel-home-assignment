import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const DURATION_MS = 4000;
const ERROR_DURATION_MS = 6000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.open(message, 'snackbar-success', DURATION_MS);
  }

  info(message: string): void {
    this.open(message, 'snackbar-info', DURATION_MS);
  }

  error(message: string): void {
    this.open(message, 'snackbar-error', ERROR_DURATION_MS);
  }

  private open(message: string, panelClass: string, duration: number): void {
    this.snackBar.open(message, $localize`:@@core.notification.close:Close`, {
      duration,
      panelClass,
      verticalPosition: 'top',
    });
  }
}
