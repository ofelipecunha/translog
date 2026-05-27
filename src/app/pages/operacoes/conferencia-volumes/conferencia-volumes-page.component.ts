import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { EmissaoEtiquetaService } from '../../../core/emissao-etiqueta/emissao-etiqueta.service';
import {
  mensagemErroEmissaoEtiqueta,
  type EmissaoEtiquetaApiDto,
} from '../../../core/emissao-etiqueta/emissao-etiqueta.models';

type StatusLeitura = 'ok' | 'duplicado' | 'divergencia';

interface LeituraRealizada {
  codigo: string;
  status: StatusLeitura;
  horario: string;
}

interface VolumeEsperado {
  seq: string;
  codigo: string;
  conferido: boolean;
}

@Component({
  selector: 'app-conferencia-volumes-page',
  imports: [FormsModule, PageBreadcrumbComponent],
  templateUrl: './conferencia-volumes-page.component.html',
})
export class ConferenciaVolumesPageComponent {
  private readonly emissaoEtiquetaService = inject(EmissaoEtiquetaService);

  readonly breadcrumbTrail = [{ label: 'Operações' }];
  readonly carregandoPedido = signal(false);

  readonly volumesEsperados = signal<VolumeEsperado[]>([]);
  numeroPedido = '';

  readonly leituras = signal<LeituraRealizada[]>([]);
  readonly ultimaLeitura = signal<LeituraRealizada | null>(null);
  readonly codigoLeitura = signal('');
  readonly mensagemLeitura = signal<string | null>(null);

  private readonly codigoInputRef = viewChild<ElementRef<HTMLInputElement>>('codigoInput');

  readonly totalLeituras = computed(() => this.leituras().length);

  readonly resumoConferidos = computed(() => this.leituras().length);

  readonly resumoFaltando = computed(
    () => this.volumesEsperados().filter((v) => !v.conferido).length,
  );

  readonly resumoDuplicados = computed(
    () => this.leituras().filter((l) => l.status === 'duplicado').length,
  );

  readonly resumoDivergencia = computed(
    () => this.leituras().filter((l) => l.status === 'divergencia').length,
  );

  onCodigoInput(valor: string): void {
    this.codigoLeitura.set(valor);
    this.mensagemLeitura.set(null);
  }

  onCodigoKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.registrarLeitura();
    }
  }

  pesquisarCodigo(): void {
    this.registrarLeitura();
  }

  limparRegistro(): void {
    this.leituras.set([]);
    this.ultimaLeitura.set(null);
    this.codigoLeitura.set('');
    this.numeroPedido = '';
    this.mensagemLeitura.set(null);
    this.volumesEsperados.set([]);
    this.focarCampoCodigo();
  }

  registrarLeitura(): void {
    const entrada = this.codigoLeitura().trim();
    if (!entrada) {
      return;
    }

    if (this.carregandoPedido()) {
      return;
    }

    const pedidoDoVolume = this.extrairPedidoDoCodigo(entrada);
    if (pedidoDoVolume) {
      this.pesquisarPorCodigoVolume(entrada, pedidoDoVolume);
      return;
    }

    this.pesquisarPorNumeroPedido(entrada);
  }

  private pesquisarPorCodigoVolume(codigo: string, pedido: string): void {
    const pedidoAtual = this.numeroPedido.trim().toLowerCase();
    const pedidoNovo = pedido.toLowerCase();
    const precisaCarregarPedido =
      this.volumesEsperados().length === 0 || (pedidoAtual && pedidoAtual !== pedidoNovo);

    if (precisaCarregarPedido) {
      this.carregarPedido(pedido, () => this.processarLeitura(codigo));
      return;
    }

    this.processarLeitura(codigo);
  }

  private pesquisarPorNumeroPedido(numeroPedido: string): void {
    const pedidoAtual = this.numeroPedido.trim().toLowerCase();
    const pedidoNovo = numeroPedido.toLowerCase();

    if (this.volumesEsperados().length > 0 && pedidoAtual === pedidoNovo) {
      this.mensagemLeitura.set('Pedido já carregado. Escaneie os códigos de volume.');
      this.codigoLeitura.set('');
      return;
    }

    this.carregarPedido(numeroPedido, () => {
      this.mensagemLeitura.set(
        `Pedido ${numeroPedido} carregado. Escaneie os códigos de volume para conferir.`,
      );
      this.codigoLeitura.set('');
    });
  }

  private carregarPedido(pedido: string, aposCarregar?: () => void): void {
    this.carregandoPedido.set(true);
    this.mensagemLeitura.set(null);
    this.numeroPedido = pedido;

    this.emissaoEtiquetaService
      .listarPorPedido(pedido)
      .pipe(finalize(() => this.carregandoPedido.set(false)))
      .subscribe({
        next: (lista) => {
          const emissao = lista.find((e) => e.status === 'EMITIDA') ?? lista[0];
          if (!emissao) {
            this.volumesEsperados.set([]);
            this.mensagemLeitura.set(`Nenhuma emissão encontrada para o pedido ${pedido}.`);
            return;
          }
          this.volumesEsperados.set(this.gerarVolumesEsperados(emissao));
          this.leituras.set([]);
          this.ultimaLeitura.set(null);
          aposCarregar?.();
        },
        error: (err) => {
          this.volumesEsperados.set([]);
          this.mensagemLeitura.set(mensagemErroEmissaoEtiqueta(err, 'buscar'));
        },
      });
  }

  private processarLeitura(codigo: string): void {
    const horario = this.formatarHorario(new Date());
    const esperado = this.volumesEsperados().find(
      (v) => v.codigo.toLowerCase() === codigo.toLowerCase(),
    );
    const jaLidoOk = this.leituras().some(
      (l) => l.status === 'ok' && l.codigo.toLowerCase() === codigo.toLowerCase(),
    );

    let status: StatusLeitura;
    let mensagem: string;

    if (!esperado) {
      status = 'divergencia';
      mensagem = 'Volume não pertence a este pedido.';
    } else if (jaLidoOk) {
      status = 'duplicado';
      mensagem = 'Volume já conferido.';
    } else {
      status = 'ok';
      mensagem = 'Volume válido!';
      this.volumesEsperados.update((lista) =>
        lista.map((v) =>
          v.codigo.toLowerCase() === codigo.toLowerCase() ? { ...v, conferido: true } : v,
        ),
      );
    }

    const leitura: LeituraRealizada = { codigo, status, horario };
    this.leituras.update((lista) => [...lista, leitura]);
    this.ultimaLeitura.set(leitura);
    this.mensagemLeitura.set(mensagem);
    this.codigoLeitura.set('');
  }

  /** Formato de etiqueta: YYYYMMDD-numeroPedido-NN */
  private extrairPedidoDoCodigo(codigo: string): string | null {
    const texto = codigo.trim();
    const match = /^(\d{8})-(.+)-(\d{2})$/.exec(texto);
    if (!match) {
      return null;
    }
    const pedido = match[2].trim();
    return pedido || null;
  }

  private focarCampoCodigo(): void {
    setTimeout(() => this.codigoInputRef()?.nativeElement.focus(), 0);
  }

  private gerarVolumesEsperados(emissao: EmissaoEtiquetaApiDto): VolumeEsperado[] {
    if (emissao.volumes?.length) {
      return emissao.volumes.map((v) => ({
        seq: String(v.numeroVolume).padStart(2, '0'),
        codigo: v.codigoEtiqueta,
        conferido: false,
      }));
    }

    const data = (emissao.dataPedido || '').replace(/-/g, '');
    const pedido = emissao.numeroPedido.trim();
    const qtde = Math.min(Math.max(emissao.quantidadeVolumes, 1), 99);

    return Array.from({ length: qtde }, (_, i) => {
      const seq = String(i + 1).padStart(2, '0');
      return {
        seq,
        codigo: `${data}-${pedido}-${seq}`,
        conferido: false,
      };
    });
  }

  private formatarHorario(data: Date): string {
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
