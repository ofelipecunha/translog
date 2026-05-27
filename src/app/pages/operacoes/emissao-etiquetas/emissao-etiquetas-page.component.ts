import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { EtiquetaBarcodeComponent } from '../../../shared/components/operacoes/etiqueta-barcode/etiqueta-barcode.component';
import { EmpresaService } from '../../../core/empresa/empresa.service';
import type { EmpresaApiDto } from '../../../core/empresa/empresa.models';
import { EmissaoEtiquetaService } from '../../../core/emissao-etiqueta/emissao-etiqueta.service';
import { mensagemErroEmissaoEtiqueta } from '../../../core/emissao-etiqueta/emissao-etiqueta.models';
import { AlertNotificationService } from '../../../shared/services/alert-notification.service';

interface EmpresaLojaOption {
  id: string;
  nome: string;
}

@Component({
  selector: 'app-emissao-etiquetas-page',
  imports: [FormsModule, PageBreadcrumbComponent, EtiquetaBarcodeComponent],
  templateUrl: './emissao-etiquetas-page.component.html',
})
export class EmissaoEtiquetasPageComponent implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly emissaoEtiquetaService = inject(EmissaoEtiquetaService);
  private readonly alerts = inject(AlertNotificationService);

  readonly breadcrumbTrail = [{ label: 'Operações' }];
  readonly empresas = signal<EmpresaLojaOption[]>([]);
  readonly carregandoEmpresas = signal(false);
  readonly empresasErro = signal<string | null>(null);

  lojaOrigemId = '';
  lojaDestinoId = '';
  numeroPedido = '';
  dataPedido = '';
  quantidadeVolumes: number | null = null;

  readonly previewVisivel = signal(false);
  readonly volumeAtual = signal(1);
  readonly formErro = signal<string | null>(null);
  readonly gravando = signal(false);

  private readonly etiquetaImpressaoRef = viewChild<ElementRef<HTMLElement>>('etiquetaImpressao');

  get lojasOrigem(): EmpresaLojaOption[] {
    return this.empresas().filter((e) => e.id !== this.lojaDestinoId);
  }

  get lojasDestino(): EmpresaLojaOption[] {
    return this.empresas().filter((e) => e.id !== this.lojaOrigemId);
  }

  readonly volumeAtualFormatado = computed(() =>
    String(this.volumeAtual()).padStart(2, '0'),
  );

  get podeNavegarAnterior(): boolean {
    return this.previewVisivel() && this.volumeAtual() > 1;
  }

  get podeNavegarProximo(): boolean {
    return this.previewVisivel() && this.volumeAtual() < this.totalVolumes;
  }

  get lojaOrigemNome(): string {
    return this.empresaPorId(this.lojaOrigemId)?.nome ?? '—';
  }

  get lojaDestinoNome(): string {
    return this.empresaPorId(this.lojaDestinoId)?.nome ?? '—';
  }

  get dataPedidoExibicao(): string {
    const d = this.dataPedido;
    if (!d) {
      return '—';
    }
    const [ano, mes, dia] = d.split('-');
    if (!ano || !mes || !dia) {
      return d;
    }
    return `${dia}/${mes}/${ano}`;
  }

  get totalVolumes(): number {
    const n = Number(this.quantidadeVolumes);
    if (!Number.isFinite(n) || n < 1) {
      return 0;
    }
    return Math.min(Math.floor(n), 99);
  }

  get totalVolumesFormatado(): string {
    return String(this.totalVolumes).padStart(2, '0');
  }

  get codigoEtiqueta(): string {
    const pedido = this.numeroPedido.trim() || '0000';
    const data = (this.dataPedido || '').replace(/-/g, '') || '00000000';
    return `${data}-${pedido}-${this.volumeAtualFormatado()}`;
  }

  ngOnInit(): void {
    this.carregarEmpresas();
  }

  carregarEmpresas(): void {
    this.empresasErro.set(null);
    this.carregandoEmpresas.set(true);
    this.empresaService
      .listar()
      .pipe(finalize(() => this.carregandoEmpresas.set(false)))
      .subscribe({
        next: (lista) => {
          const ativas = lista
            .filter((e) => (e.ativo ?? 'S').trim().toUpperCase() === 'S')
            .map((e) => this.mapearEmpresaOpcao(e))
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
          this.empresas.set(ativas);
          this.sanitizarSelecoesEmpresas();
        },
        error: () => {
          this.empresas.set([]);
          this.empresasErro.set('Não foi possível carregar as empresas.');
        },
      });
  }

  onLojaOrigemChange(id: string): void {
    this.lojaOrigemId = id;
    this.limparMensagensFormulario();
    if (id && this.lojaDestinoId === id) {
      this.lojaDestinoId = '';
    }
  }

  onLojaDestinoChange(id: string): void {
    this.lojaDestinoId = id;
    this.limparMensagensFormulario();
    if (id && this.lojaOrigemId === id) {
      this.lojaOrigemId = '';
    }
  }

  gerarEtiquetas(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.volumeAtual.set(1);
    this.previewVisivel.set(true);
  }

  gravarEtiqueta(): void {
    if (!this.validarFormulario() || this.gravando()) {
      return;
    }

    this.gravando.set(true);
    this.emissaoEtiquetaService
      .criar({
        codEmpresaOrigem: Number(this.lojaOrigemId),
        codEmpresaDestino: Number(this.lojaDestinoId),
        numeroPedido: this.numeroPedido.trim(),
        dataPedido: this.dataPedido,
        quantidadeVolumes: this.totalVolumes,
      })
      .pipe(finalize(() => this.gravando.set(false)))
      .subscribe({
        next: () => {
          this.formErro.set(null);
          this.alerts.success('Sucesso', 'Cadastro realizado com sucesso.');
        },
        error: (err) => {
          this.alerts.error('Erro', mensagemErroEmissaoEtiqueta(err, 'gravar'));
        },
      });
  }

  volumeAnterior(): void {
    if (this.podeNavegarAnterior) {
      this.volumeAtual.update((v) => v - 1);
    }
  }

  volumeProximo(): void {
    if (this.podeNavegarProximo) {
      this.volumeAtual.update((v) => v + 1);
    }
  }

  imprimirEtiqueta(): void {
    const elemento = this.etiquetaImpressaoRef()?.nativeElement;
    if (!elemento) {
      return;
    }

    const janela = window.open('', '_blank', 'noopener,noreferrer');
    if (!janela) {
      this.formErro.set('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
      return;
    }

    janela.document.open();
    janela.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Etiqueta ${this.codigoEtiqueta}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 12mm; font-family: ui-sans-serif, system-ui, sans-serif; color: #111827; }
    .etiqueta-impressao { max-width: 100mm; margin: 0 auto; border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; background: #fff; }
    .etiqueta-impressao > p { text-align: center; font-size: 18px; font-weight: 700; letter-spacing: 0.05em; margin: 0 0 16px; }
    .etiqueta-impressao svg { display: block; width: 100%; height: auto; }
    .etiqueta-impressao .rodape { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
    .etiqueta-impressao ul { margin: 0; padding: 0; list-style: none; font-size: 11px; color: #4b5563; }
    .etiqueta-impressao li { margin: 2px 0; }
    .etiqueta-impressao .volume-badge { border: 2px solid #111827; border-radius: 6px; padding: 6px 12px; font-size: 14px; font-weight: 700; min-width: 56px; text-align: center; }
    @media print { body { padding: 0; } .etiqueta-impressao { border: none; } }
  </style>
</head>
<body>${elemento.outerHTML}</body>
</html>`);
    janela.document.close();

    const executarImpressao = (): void => {
      janela.focus();
      janela.print();
      janela.close();
    };

    setTimeout(executarImpressao, 300);
  }

  private mapearEmpresaOpcao(dto: EmpresaApiDto): EmpresaLojaOption {
    const fantasia = dto.nomeFantasia?.trim();
    const razao = dto.razaoSocial?.trim() ?? '';
    const nome =
      fantasia && fantasia.toLowerCase() !== razao.toLowerCase()
        ? `${fantasia} — ${razao}`
        : razao || fantasia || `Empresa ${dto.codEmpresa}`;
    return {
      id: String(dto.codEmpresa),
      nome,
    };
  }

  private validarFormulario(): boolean {
    this.limparMensagensFormulario();

    if (!this.lojaOrigemId || !this.lojaDestinoId) {
      this.formErro.set('Selecione a loja de origem e destino.');
      return false;
    }
    if (this.lojaOrigemId === this.lojaDestinoId) {
      this.formErro.set('A loja de origem deve ser diferente da loja de destino.');
      return false;
    }
    if (!this.numeroPedido.trim()) {
      this.formErro.set('Informe o número do pedido.');
      return false;
    }
    if (!this.dataPedido) {
      this.formErro.set('Informe a data do pedido.');
      return false;
    }
    if (this.totalVolumes < 1) {
      this.formErro.set('Informe a quantidade de volumes (mínimo 1).');
      return false;
    }

    return true;
  }

  private limparMensagensFormulario(): void {
    this.formErro.set(null);
  }

  private sanitizarSelecoesEmpresas(): void {
    const ids = new Set(this.empresas().map((e) => e.id));
    if (this.lojaOrigemId && !ids.has(this.lojaOrigemId)) {
      this.lojaOrigemId = '';
    }
    if (this.lojaDestinoId && !ids.has(this.lojaDestinoId)) {
      this.lojaDestinoId = '';
    }
    if (this.lojaOrigemId && this.lojaOrigemId === this.lojaDestinoId) {
      this.lojaDestinoId = '';
    }
  }

  private empresaPorId(id: string): EmpresaLojaOption | undefined {
    return this.empresas().find((e) => e.id === id);
  }
}
