import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { AlertNotificationService } from '../../../shared/services/alert-notification.service';

type FormElementRow = {
  id: number;
  nome: string;
  tipo: string;
  criadoEm: string;
  ativo: boolean;
};

@Component({
  selector: 'app-form-elements-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PageBreadcrumbComponent,
    BadgeComponent,
  ],
  templateUrl: './form-elements-list.component.html',
})
export class FormElementsListComponent {
  private readonly alerts = inject(AlertNotificationService);

  readonly breadcrumbTrail = [{ label: 'Lançamentos' }];

  private readonly allRows = signal<FormElementRow[]>([
    { id: 1, nome: 'Entrada padrão', tipo: 'Texto', criadoEm: '12/01/2026', ativo: true },
    { id: 2, nome: 'Seleção', tipo: 'Lista', criadoEm: '03/02/2026', ativo: true },
    { id: 3, nome: 'Observações', tipo: 'Área de texto', criadoEm: '18/02/2026', ativo: false },
    { id: 4, nome: 'Anexo', tipo: 'Arquivo', criadoEm: '01/03/2026', ativo: true },
    { id: 5, nome: 'Preferências', tipo: 'Checkbox', criadoEm: '22/03/2026', ativo: true },
    { id: 6, nome: 'Perfil', tipo: 'Misto', criadoEm: '05/04/2026', ativo: true },
    { id: 7, nome: 'Data de nascimento', tipo: 'Data', criadoEm: '10/04/2026', ativo: true },
    { id: 8, nome: 'Valor monetário', tipo: 'Número', criadoEm: '15/04/2026', ativo: true },
    { id: 9, nome: 'Aceite de termos', tipo: 'Checkbox', criadoEm: '20/04/2026', ativo: false },
    { id: 10, nome: 'Categoria', tipo: 'Lista', criadoEm: '25/04/2026', ativo: true },
    { id: 11, nome: 'Descrição longa', tipo: 'Área de texto', criadoEm: '01/05/2026', ativo: true },
    { id: 12, nome: 'Imagem de perfil', tipo: 'Arquivo', criadoEm: '02/05/2026', ativo: true },
  ]);

  readonly excluindoId = signal<number | null>(null);

  filterNome = '';
  filterTipo = '';

  private readonly criteria = signal<{ nome: string; tipo: string }>({
    nome: '',
    tipo: '',
  });

  readonly pageSize = 5;
  readonly currentPage = signal(1);

  readonly displayedRows = computed(() => {
    const { nome, tipo } = this.criteria();
    const n = nome.trim().toLowerCase();
    const t = tipo.trim().toLowerCase();
    return this.allRows().filter((row) => {
      const matchNome = !n || row.nome.toLowerCase().includes(n);
      const matchTipo = !t || row.tipo.toLowerCase().includes(t);
      return matchNome && matchTipo;
    });
  });

  readonly totalFiltrado = computed(() => this.displayedRows().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalFiltrado() / this.pageSize)),
  );

  readonly paginatedRows = computed(() => {
    const rows = this.displayedRows();
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  });

  readonly startEntry = computed(() => {
    if (this.totalFiltrado() === 0) {
      return 0;
    }
    return (this.currentPage() - 1) * this.pageSize + 1;
  });

  readonly endEntry = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.totalFiltrado()),
  );

  readonly visiblePages = computed(() => {
    const maxVisible = 5;
    const total = this.totalPages();
    const current = Math.min(this.currentPage(), total);
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  readonly totalCadastro = computed(() => this.allRows().length);

  pesquisar(): void {
    this.criteria.set({
      nome: this.filterNome,
      tipo: this.filterTipo,
    });
    this.currentPage.set(1);
  }

  irParaPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  paginaAnterior(): void {
    this.irParaPagina(this.currentPage() - 1);
  }

  paginaProxima(): void {
    this.irParaPagina(this.currentPage() + 1);
  }

  confirmarExcluir(row: FormElementRow): void {
    if (
      !confirm(`Excluir o form element "${row.nome}"? Esta ação não pode ser desfeita.`)
    ) {
      return;
    }
    this.excluindoId.set(row.id);
    this.allRows.update((rows) => rows.filter((r) => r.id !== row.id));
    this.excluindoId.set(null);
    this.alerts.success(
      'Excluído',
      `O form element "${row.nome}" foi excluído com sucesso.`,
    );
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }
}
