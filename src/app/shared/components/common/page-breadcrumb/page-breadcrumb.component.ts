import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export type PageBreadcrumbTrailItem = { label: string; link?: string };

@Component({
  selector: 'app-page-breadcrumb',
  imports: [
    RouterModule,
  ],
  templateUrl: './page-breadcrumb.component.html',
  styles: ``
})
export class PageBreadcrumbComponent {
  @Input() pageTitle = '';
  /** Segmentos opcionais entre Home e o título atual (ex.: Lançamentos → Form Elements). */
  @Input() trail: PageBreadcrumbTrailItem[] = [];
  /**
   * Quando false: caminho completo em cima (texto menor, cinza, com `>`) e o nome da
   * tela repetido abaixo em destaque (fonte maior), no estilo do exemplo Financeiro.
   */
  @Input() showHeading = true;
}
