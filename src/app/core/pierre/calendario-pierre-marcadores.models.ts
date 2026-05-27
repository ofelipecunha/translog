import type { PierreTransacao } from './pierre.models';
import type { PierreBancoTransacao } from './pierre-transacao-format.util';

/** Marcador visual no calendário (sem persistência no backend PortalF). */
export type CalendarioMarcadorOrigem = 'lembrete' | 'emprestimo' | 'extrato';

export interface CalendarioMarcadorDia {
  id: string;
  titulo: string;
  data: string;
  valor: number | null;
  origem: CalendarioMarcadorOrigem;
  /** Banco do extrato (`get-transactions`). */
  banco?: PierreBancoTransacao;
  status?: string;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  /** Preenchido quando `origem === 'extrato'` (API get-transactions). */
  transacoes?: PierreTransacao[];
}

export const CALENDARIO_MARCADOR_COR = 'warning';
export const CALENDARIO_NUBANK_COR = 'nubank';
export const CALENDARIO_BB_COR = 'bb';

export const CALENDARIO_NUBANK_HEX = '#820ad1';
export const CALENDARIO_BB_HEX = '#fdfc30';
