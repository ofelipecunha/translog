import { Injectable, signal } from '@angular/core';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertNotification {
  id: number;
  variant: AlertVariant;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AlertNotificationService {
  private seq = 0;
  private readonly alertsState = signal<AlertNotification[]>([]);

  readonly alerts = this.alertsState.asReadonly();

  success(title: string, message: string, durationMs = 5000): void {
    this.show('success', title, message, durationMs);
  }

  error(title: string, message: string, durationMs = 6000): void {
    this.show('error', title, message, durationMs);
  }

  info(title: string, message: string, durationMs = 5000): void {
    this.show('info', title, message, durationMs);
  }

  warning(title: string, message: string, durationMs = 5000): void {
    this.show('warning', title, message, durationMs);
  }

  dismiss(id: number): void {
    this.alertsState.update((items) => items.filter((a) => a.id !== id));
  }

  private show(
    variant: AlertVariant,
    title: string,
    message: string,
    durationMs: number,
  ): void {
    const id = ++this.seq;
    this.alertsState.update((items) => [...items, { id, variant, title, message }]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }
}
