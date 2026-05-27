import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { CategoriaService } from '../../../core/categoria/categoria.service';
import { AlertNotificationService } from '../../../shared/services/alert-notification.service';
import {
  type CategoriaLinha,
  mapearLinhaCategoria,
  mensagemErroCategoria,
} from '../../../core/categoria/categoria.models';

@Component({
  selector: 'app-categorias-list',
  imports: [CommonModule, FormsModule, RouterLink, PageBreadcrumbComponent, BadgeComponent],
  templateUrl: './categorias-list.component.html',
})
export class CategoriasListComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly alerts = inject(AlertNotificationService);

  readonly breadcrumbTrail = [{ label: 'Lançamentos' }];

  readonly listaCarregando = signal(false);
  readonly listaErro = signal<string | null>(null);
  readonly excluindoId = signal<number | null>(null);

  private readonly allRows = signal<CategoriaLinha[]>([]);

  filterNome = '';

  private readonly criteria = signal<{ nome: string }>({ nome: '' });

  readonly pageSize = 5;
  readonly currentPage = signal(1);

  readonly displayedRows = computed(() => {
    const { nome } = this.criteria();
    const n = nome.trim().toLowerCase();
    return this.allRows().filter((row) => !n || row.nome.toLowerCase().includes(n));
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

  ngOnInit(): void {
    this.carregarLista();
  }

  carregarLista(): void {
    this.listaErro.set(null);
    this.listaCarregando.set(true);
    this.categoriaService
      .listar()
      .pipe(finalize(() => this.listaCarregando.set(false)))
      .subscribe({
        next: (lista) => {
          this.allRows.set(lista.map(mapearLinhaCategoria));
          this.pesquisar();
        },
        error: (err: unknown) => {
          const msg = mensagemErroCategoria(err, 'listar');
          this.listaErro.set(msg);
          this.alerts.error('Erro ao listar', msg);
          this.allRows.set([]);
        },
      });
  }

  pesquisar(): void {
    this.criteria.set({ nome: this.filterNome });
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

  confirmarExcluir(row: CategoriaLinha): void {
    if (
      !confirm(`Excluir a categoria "${row.nome}"? Esta ação não pode ser desfeita.`)
    ) {
      return;
    }
    this.excluindoId.set(row.id);
    this.categoriaService
      .excluir(row.id)
      .pipe(finalize(() => this.excluindoId.set(null)))
      .subscribe({
        next: () => {
          this.alerts.success(
            'Excluído',
            `A categoria "${row.nome}" foi excluída com sucesso.`,
          );
          this.carregarLista();
        },
        error: (err: unknown) => {
          const msg = mensagemErroCategoria(err, 'excluir');
          this.listaErro.set(msg);
          this.alerts.error('Erro ao excluir', msg);
        },
      });
  }

  corTipo(row: CategoriaLinha): 'success' | 'error' {
    return row.tipoRaw === 'RECEITA' ? 'success' : 'error';
  }
}
