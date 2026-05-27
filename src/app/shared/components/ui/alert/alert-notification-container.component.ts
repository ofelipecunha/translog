import { Component, inject } from '@angular/core';
import { AlertComponent } from './alert.component';
import { AlertNotificationService } from '../../../services/alert-notification.service';

@Component({
  selector: 'app-alert-notification-container',
  imports: [AlertComponent],
  templateUrl: './alert-notification-container.component.html',
})
export class AlertNotificationContainerComponent {
  private readonly alertService = inject(AlertNotificationService);

  readonly alerts = this.alertService.alerts;

  dismiss(id: number): void {
    this.alertService.dismiss(id);
  }
}
