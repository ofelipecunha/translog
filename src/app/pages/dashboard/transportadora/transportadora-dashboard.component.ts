import { Component } from '@angular/core';
import { TransportMetricsComponent } from '../../../shared/components/transportadora/transport-metrics/transport-metrics.component';
import { MonthlyDeliveriesChartComponent } from '../../../shared/components/transportadora/monthly-deliveries-chart/monthly-deliveries-chart.component';
import { DeliveryTargetComponent } from '../../../shared/components/transportadora/delivery-target/delivery-target.component';
import { RecentFreightsComponent } from '../../../shared/components/transportadora/recent-freights/recent-freights.component';

@Component({
  selector: 'app-transportadora-dashboard',
  imports: [
    TransportMetricsComponent,
    MonthlyDeliveriesChartComponent,
    DeliveryTargetComponent,
    RecentFreightsComponent,
  ],
  templateUrl: './transportadora-dashboard.component.html',
})
export class TransportadoraDashboardComponent {}
