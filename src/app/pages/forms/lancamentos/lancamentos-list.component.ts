import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { CategoriaService } from '../../../core/categoria/categoria.service';
import type { CategoriaApiDto } from '../../../core/categoria/categoria.models';
import { LancamentoService } from '../../../core/lancamento/lancamento.service';
import { AlertNotificationService } from '../../../shared/services/alert-notification.service';
import {
  formatarMoedaBrl,
  mapearLinhaLancamento,
  mensagemErroLancamento,
  type LancamentoLinha,
} from '../../../core/lancamento/lancamento.models';

@Component({
  selector: 'app-lancamentos-list',
  imports: [CommonModule, FormsModule, RouterLink, PageBreadcrumbComponent, BadgeComponent],
  templateUrl: './lancamentos-list.component.html',
})
export class LancamentosListComponent implements OnInit {
  private readonly lancamentoService = inject(LancamentoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly alerts = inject(AlertNotificationService);

  readonly breadcrumbTrail = [{ label: 'Lançamentos' }];

  readonly listaCarregando = signal(false);
  readonly listaErro = signal<string | null>(null);
  readonly excluindoId = signal<number | null>(null);

  categoriasFiltro: CategoriaApiDto[] = [];

  filterDescricao = '';
  filterCategoriaId: number | null = null;
  filterSomenteStreaming = false;
  filterDataInicio = '';
  filterDataFim = '';

  private readonly allRows = signal<LancamentoLinha[]>([]);

  private readonly criteria = signal<{
    descricao: string;
    categoriaId: number | null;
    somenteStreaming: boolean;
  }>({ descricao: '', categoriaId: null, somenteStreaming: false });

  readonly pageSize = 5;
  readonly currentPage = signal(1);

  readonly displayedRows = computed(() => {
    const { descricao, categoriaId, somenteStreaming } = this.criteria();
    const q = descricao.trim().toLowerCase();
    return this.allRows().filter((row) => {
      if (somenteStreaming && !row.streaming) {
        return false;
      }
      if (categoriaId != null && row.categoriaId !== categoriaId) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        row.descricao.toLowerCase().includes(q) ||
        row.categoriaNome.toLowerCase().includes(q)
      );
    });
  });

  readonly resumo = computed(() => {
    let receitas = 0;
    let despesas = 0;
    for (const row of this.displayedRows()) {
      if (row.tipoRaw.toUpperCase() === 'RECEITA') {
        receitas += row.valor;
      } else {
        despesas += row.valor;
      }
    }
    return { receitas, despesas, saldo: receitas - despesas };
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

  readonly formatarMoeda = formatarMoedaBrl;

  ngOnInit(): void {
    this.carregarCategoriasFiltro();
    this.carregarLista();
  }

  private carregarCategoriasFiltro(): void {
    this.categoriaService.listar().subscribe({
      next: (lista) => {
        this.categoriasFiltro = lista
          .filter((c) => c.ativo)
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      },
      error: () => {
        this.categoriasFiltro = [];
      },
    });
  }

  carregarLista(): void {
    this.listaErro.set(null);
    this.listaCarregando.set(true);

    const dataInicio = this.filterDataInicio.trim() || undefined;
    const dataFim = this.filterDataFim.trim() || undefined;

    this.lancamentoService
      .listar({ dataInicio, dataFim })
      .pipe(finalize(() => this.listaCarregando.set(false)))
      .subscribe({
        next: (lista) => {
          this.allRows.set(lista.map(mapearLinhaLancamento));
          this.aplicarFiltrosLocais();
        },
        error: (err: unknown) => {
          const msg = mensagemErroLancamento(err, 'listar');
          this.listaErro.set(msg);
          this.alerts.error('Erro ao listar', msg);
          this.allRows.set([]);
        },
      });
  }

  pesquisar(): void {
    const di = this.filterDataInicio.trim();
    const df = this.filterDataFim.trim();
    if (di && df && di > df) {
      this.alerts.error('Período inválido', 'Data início não pode ser posterior à data fim.');
      return;
    }
    this.carregarLista();
  }

  aplicarFiltrosLocais(): void {
    this.criteria.set({
      descricao: this.filterDescricao,
      categoriaId: this.filterCategoriaId,
      somenteStreaming: this.filterSomenteStreaming,
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

  corTipo(row: LancamentoLinha): 'success' | 'error' | 'warning' {
    if (row.streaming) {
      return 'warning';
    }
    return row.tipoRaw.toUpperCase() === 'RECEITA' ? 'success' : 'error';
  }

  classeValor(row: LancamentoLinha): string {
    if (row.streaming) {
      return 'text-warning-600 dark:text-warning-400';
    }
    return row.tipoRaw.toUpperCase() === 'RECEITA'
      ? 'text-success-600 dark:text-success-400'
      : 'text-error-600 dark:text-error-400';
  }

  confirmarExcluir(row: LancamentoLinha): void {
    const resumo = `${row.dataFormatada} · ${row.descricao !== '—' ? row.descricao : row.categoriaNome}`;
    if (!confirm(`Excluir o lançamento "${resumo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    this.excluindoId.set(row.id);
    this.lancamentoService
      .excluir(row.id)
      .pipe(finalize(() => this.excluindoId.set(null)))
      .subscribe({
        next: () => {
          this.alerts.success('Excluído', 'Lançamento excluído com sucesso.');
          this.carregarLista();
        },
        error: (err: unknown) => {
          const msg = mensagemErroLancamento(err, 'excluir');
          this.listaErro.set(msg);
          this.alerts.error('Erro ao excluir', msg);
        },
      });
  }
}
