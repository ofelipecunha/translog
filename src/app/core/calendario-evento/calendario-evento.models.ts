import { HttpErrorResponse } from '@angular/common/http';

export interface CalendarioEventoApiDto {
  id: number;
  descricao: string;
  dataEvento: string;
  tipo: string;
  concluido: boolean;
  dataCriacao: string | null;
}

export interface CalendarioEventoPayload {
  descricao: string;
  dataEvento: string;
  tipo: string;
  concluido: boolean;
}

export const CALENDARIO_TIPO_PADRAO = 'NOTACAO';

export type CalendarioEventoItem = {
  id: number;
  descricao: string;
  dataEvento: string;
  tipo: string;
  concluido: boolean;
};

export function dtoParaCalendarioEventoItem(dto: CalendarioEventoApiDto): CalendarioEventoItem {
  return {
    id: dto.id,
    descricao: dto.descricao,
    dataEvento: normalizarDataEvento(dto.dataEvento),
    tipo: (dto.tipo ?? CALENDARIO_TIPO_PADRAO).toUpperCase(),
    concluido: !!dto.concluido,
  };
}

export function normalizarDataEvento(v: unknown): string {
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

export function classeCorEvento(tipo: string): string {
  const t = (tipo ?? '').trim().toUpperCase();
  if (t === 'NOTACAO' || t === '') {
    return 'primary';
  }
  return 'primary';
}

export function mensagemErroCalendarioEvento(
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
