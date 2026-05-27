import { BRASIL_ESTADOS } from '../geo/brasil-estados';

const PERFIL_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
  MOTORISTA: 'Motorista',
  CLIENTE: 'Cliente',
  USUARIO: 'Usuário',
};

export function labelPerfil(perfil: string | null | undefined): string {
  if (!perfil?.trim()) {
    return '—';
  }
  const key = perfil.trim().toUpperCase();
  return PERFIL_LABELS[key] ?? perfil;
}

export function labelEstado(sigla: string | null | undefined): string {
  if (!sigla?.trim()) {
    return '';
  }
  const uf = sigla.trim().toUpperCase();
  const found = BRASIL_ESTADOS.find((e) => e.sigla === uf);
  return found ? `${found.nome} (${uf})` : uf;
}

export function formatLocalizacao(
  cidade: string | null | undefined,
  estado: string | null | undefined,
): string {
  const c = cidade?.trim();
  const uf = estado?.trim().toUpperCase();
  if (c && uf) {
    return `${c} — ${uf}`;
  }
  if (c) {
    return c;
  }
  if (uf) {
    return labelEstado(uf) || uf;
  }
  return '—';
}
