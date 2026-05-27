import { HttpErrorResponse } from '@angular/common/http';

export interface FormaPagamentoApiDto {
  id: number;
  nome: string;
  tipo: string | null;
  ativo: boolean;
  dataCriacao: string | null;
}

export interface FormaPagamentoPayload {
  nome: string;
  tipo: string | null;
  ativo: boolean;
}

export type FormaPagamentoLinha = {
  id: number;
  nome: string;
  tipoRaw: string | null;
  tipoLabel: string;
  criadoEm: string;
  ativo: boolean;
};

export const FORMA_PAGAMENTO_TIPO_OPCOES = [
  { valor: 'CREDITO', rotulo: 'Crédito' },
  { valor: 'DEBITO', rotulo: 'Débito' },
  { valor: 'DINHEIRO', rotulo: 'Dinheiro' },
  { valor: 'DIGITAL', rotulo: 'Digital' },
] as const;

export function etiquetaTipo(tipo: string | null | undefined): string {
  switch ((tipo ?? '').toUpperCase()) {
    case 'CREDITO':
      return 'Crédito';
    case 'DEBITO':
      return 'Débito';
    case 'DINHEIRO':
      return 'Dinheiro';
    case 'DIGITAL':
      return 'Digital';
    default:
      return tipo?.trim() ? tipo : '—';
  }
}

export function formatarDataCriacao(iso: string | null | undefined): string {
  if (!iso?.trim()) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function mapearLinhaApi(dto: FormaPagamentoApiDto): FormaPagamentoLinha {
  return {
    id: dto.id,
    nome: dto.nome,
    tipoRaw: dto.tipo,
    tipoLabel: etiquetaTipo(dto.tipo),
    criadoEm: formatarDataCriacao(dto.dataCriacao),
    ativo: dto.ativo,
  };
}

export function mensagemErroApi(err: unknown, contexto: 'listar' | 'salvar' | 'excluir'): string {
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
