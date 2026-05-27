import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface LancamentoApiDto {
  id: number;
  descricao: string | null;
  valor: number;
  dataLancamento: string;
  categoriaId: number;
  categoriaNome: string;
  tipo: string;
  tipoStreaming?: boolean;
  formaPagamento: string | null;
  formaPagamentoId: number | null;
  formaPagamentoNome: string | null;
  pago: boolean;
  dataCriacao: string | null;
}

export interface LancamentoPayload {
  descricao: string | null;
  valor: number;
  dataLancamento: string;
  categoriaId: number;
  tipo: 'RECEITA' | 'DESPESA';
  formaPagamentoId: number | null;
  pago: boolean;
}

export type LancamentoLinha = {
  id: number;
  descricao: string;
  valor: number;
  dataLancamento: string;
  dataFormatada: string;
  categoriaId: number;
  categoriaNome: string;
  tipoRaw: string;
  tipoLabel: string;
  formaPagamentoNome: string;
  pago: boolean;
  streaming: boolean;
};

export const LANCAMENTO_TIPO_OPCOES = [
  { valor: 'RECEITA' as const, rotulo: 'Receita' },
  { valor: 'DESPESA' as const, rotulo: 'Despesa' },
] as const;

export function isoHojeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function normalizarLocalDateParaIso(v: unknown): string {
  if (typeof v === 'string') {
    return v.length >= 10 ? v.slice(0, 10) : '';
  }
  if (Array.isArray(v) && v.length >= 3) {
    const y = v[0] as number;
    const m = Number(v[1]);
    const day = Number(v[2]);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${y}-${pad(m)}-${pad(day)}`;
  }
  return '';
}

export function normalizarPagoFlag(v: unknown): boolean {
  if (typeof v === 'boolean') {
    return v;
  }
  if (typeof v === 'string') {
    const s = v.trim().toUpperCase();
    return s === 'S' || s === 'SIM' || s === 'Y' || s === '1' || s === 'TRUE';
  }
  if (typeof v === 'number') {
    return v !== 0;
  }
  return false;
}

export function indicaLancamentoStreaming(l: LancamentoApiDto): boolean {
  if (l.tipoStreaming === true) {
    return true;
  }
  const t = (l.tipo ?? '').trim();
  if (t === 'tipoStreaming' || t.toUpperCase() === 'TIPOSTREAMING') {
    return true;
  }
  const ids = environment.lancamentosCategoriaStreamingIds ?? [];
  if (ids.length > 0 && ids.includes(l.categoriaId)) {
    return true;
  }
  const cat = (l.categoriaNome ?? '').toLowerCase();
  if (
    cat.includes('stream') ||
    cat.includes('streaming') ||
    cat.includes('assinatura') ||
    cat.includes('subscription')
  ) {
    return true;
  }
  return false;
}

export function normalizarLancamento(d: LancamentoApiDto): LancamentoApiDto {
  const rawTipo = String(d.tipo ?? 'DESPESA').trim();
  const upper = rawTipo.toUpperCase();
  let tipoNorm: string;
  if (upper === 'TIPOSTREAMING' || rawTipo === 'tipoStreaming') {
    tipoNorm = 'tipoStreaming';
  } else {
    tipoNorm = upper === 'RECEITA' ? 'RECEITA' : 'DESPESA';
  }

  const merged: LancamentoApiDto = {
    ...d,
    dataLancamento: normalizarLocalDateParaIso(d.dataLancamento as unknown),
    tipo: tipoNorm,
    valor: typeof d.valor === 'number' ? d.valor : Number(d.valor) || 0,
    pago: normalizarPagoFlag((d as { pago?: unknown }).pago),
  };

  const tipoStreamingFlag =
    typeof d.tipoStreaming === 'boolean' ? d.tipoStreaming : indicaLancamentoStreaming(merged);

  return {
    ...merged,
    tipoStreaming: tipoStreamingFlag,
  };
}

export function etiquetaTipoLancamento(tipo: string): string {
  const t = (tipo ?? '').trim();
  if (t === 'tipoStreaming' || t.toUpperCase() === 'TIPOSTREAMING') {
    return 'Streaming';
  }
  return tipo.toUpperCase() === 'RECEITA' ? 'Receita' : 'Despesa';
}

export function formatarDataLancamento(iso: string): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

export function formatarMoedaBrl(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0);
}

export function mapearLinhaLancamento(dto: LancamentoApiDto): LancamentoLinha {
  const norm = normalizarLancamento(dto);
  return {
    id: norm.id,
    descricao: norm.descricao?.trim() || '—',
    valor: norm.valor,
    dataLancamento: norm.dataLancamento,
    dataFormatada: formatarDataLancamento(norm.dataLancamento),
    categoriaId: norm.categoriaId,
    categoriaNome: norm.categoriaNome?.trim() || '—',
    tipoRaw: norm.tipo,
    tipoLabel: etiquetaTipoLancamento(norm.tipo),
    formaPagamentoNome: norm.formaPagamentoNome?.trim() || '—',
    pago: norm.pago,
    streaming: !!norm.tipoStreaming,
  };
}

export function mensagemErroLancamento(
  err: unknown,
  contexto: 'listar' | 'salvar' | 'excluir',
): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: string } | null;
    if (body?.message && typeof body.message === 'string') {
      return body.message;
    }
    if (err.status === 0) {
      return 'Sem conexão com a API. Verifique se o servidor está no ar.';
    }
    return `Erro ao ${contexto} (HTTP ${err.status}).`;
  }
  return `Não foi possível ${contexto}.`;
}
