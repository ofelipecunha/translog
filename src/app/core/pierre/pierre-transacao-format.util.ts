import type { PierrePaymentReminder, PierreTransacao } from './pierre.models';

export type PierreBancoTransacao = 'nubank' | 'bb';

export function transacaoBancoPierre(txn: PierreTransacao): PierreBancoTransacao | null {
  const texto = `${txn.account_name ?? ''} ${txn.account_marketing_name ?? ''}`.toLowerCase();
  if (/nubank|\bnu\b|nu pagamentos/.test(texto)) {
    return 'nubank';
  }
  if (/banco do brasil|\bbb\b/.test(texto)) {
    return 'bb';
  }
  return null;
}

export function descricaoTransacaoPierre(txn: PierreTransacao): string {
  const d = txn.description?.trim() ?? '';
  if (!d) {
    return '—';
  }
  const pipe = d.indexOf('|');
  if (pipe >= 0) {
    const resto = d.slice(pipe + 1).trim();
    return resto.length > 0 ? resto : d;
  }
  return d;
}

export function categoriaTransacaoPierre(txn: PierreTransacao): string {
  return txn.category?.trim() || txn.original_category?.trim() || '—';
}

export function formatarDataTransacaoPierre(iso: string): string {
  if (!iso?.trim()) {
    return iso ?? '';
  }
  const s = iso.trim();
  const cal = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (cal) {
    const [, y, m, d] = cal;
    return `${d}/${m}/${y}`;
  }
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) {
    return s;
  }
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function paraNumeroTransacao(valor: unknown): number {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0;
  }
  if (typeof valor === 'string') {
    const n = Number(valor.replace(',', '.').trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function formatarMoedaPierre(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function formatarValorMovimentacaoPierre(valor: number | string): string {
  const numero = paraNumeroTransacao(valor);
  const moeda = formatarMoedaPierre(Math.abs(numero));
  return numero < 0 ? `- ${moeda}` : `+ ${moeda}`;
}

export function classeMovimentacaoPierre(valor: number | string): string {
  return paraNumeroTransacao(valor) < 0 ? 'text-error-500' : 'text-success-500';
}

export function normalizarDataTransacaoPierre(valor: unknown): string {
  if (typeof valor === 'string') {
    return valor.length >= 10 ? valor.slice(0, 10) : '';
  }
  return '';
}

/** Desconto de empréstimo (ex.: EMPRESTIMO CDC) no extrato ou lembrete Pierre. */
export function isEmprestimoTransacaoPierre(txn: PierreTransacao): boolean {
  const texto = [
    txn.description ?? '',
    descricaoTransacaoPierre(txn),
    txn.category ?? '',
    txn.original_category ?? '',
    txn.type ?? '',
    txn.account_subtype ?? '',
  ]
    .join(' ')
    .toUpperCase();

  return /EMPREST|EMPR[EÉ]ST/.test(texto);
}

export function isEmprestimoLembretePierre(item: PierrePaymentReminder): boolean {
  const texto = (item.title ?? '').toUpperCase();
  return /EMPREST|EMPR[EÉ]ST|CDC/.test(texto);
}

/** Exibe lembrete de empréstimo futuro na mesma tabela do extrato do dia. */
export function lembreteEmprestimoParaTransacaoPierre(item: PierrePaymentReminder): PierreTransacao {
  return {
    id: item.id ?? `lembrete-emprestimo-${item.dueDate}`,
    description: item.title?.trim() || 'EMPRESTIMO',
    category: 'Empréstimo (previsto)',
    currency_code: 'BRL',
    amount: item.amount ?? 0,
    balance: 0,
    date: item.dueDate,
    type: 'DEBIT',
    status: item.status ?? 'scheduled',
    account_name: '—',
    account_type: '',
    account_subtype: '',
  };
}
