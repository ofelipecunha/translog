import { Component, Input } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-transport-page-shell',
  imports: [PageBreadcrumbComponent],
  templateUrl: './transport-page-shell.component.html',
})
export class TransportPageShellComponent {
  @Input({ required: true }) pageTitle!: string;
  @Input({ required: true }) description!: string;
  @Input() cardTitle = 'Em desenvolvimento';
}
