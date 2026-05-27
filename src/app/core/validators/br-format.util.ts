/** E-mail no formato usuario@dominio.ext (aceita subdomínios e TLD com 2+ letras). */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function isEmailValido(email: string): boolean {
  const v = email.trim();
  return v.length > 0 && EMAIL_REGEX.test(v);
}

/** Aplica máscara brasileira: (11) 99999-9999 ou (11) 3333-3333 */
export function formatarTelefoneBr(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) {
    return '';
  }
  if (d.length <= 2) {
    return `(${d}`;
  }
  if (d.length <= 6) {
    return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  }
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/** Retorna só dígitos (10 ou 11) para enviar à API. */
export function telefoneSomenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 11);
}

export function isTelefoneBrValido(valor: string): boolean {
  const d = telefoneSomenteDigitos(valor);
  if (d.length === 0) {
    return true;
  }
  return d.length === 10 || d.length === 11;
}

export function formatarTelefoneExibicao(valor: string | null | undefined): string {
  const d = telefoneSomenteDigitos(valor ?? '');
  if (!d) {
    return '—';
  }
  return formatarTelefoneBr(d);
}

/** Máscara CNPJ: 00.000.000/0000-00 */
export function formatarCnpj(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 14);
  if (d.length === 0) {
    return '';
  }
  if (d.length <= 2) {
    return d;
  }
  if (d.length <= 5) {
    return `${d.slice(0, 2)}.${d.slice(2)}`;
  }
  if (d.length <= 8) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  }
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

export function cnpjSomenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 14);
}

export function isCnpjValido(valor: string): boolean {
  return cnpjSomenteDigitos(valor).length === 14;
}

export function formatarCnpjExibicao(valor: string | null | undefined): string {
  const d = cnpjSomenteDigitos(valor ?? '');
  if (!d) {
    return '—';
  }
  return formatarCnpj(d);
}

/** Máscara CEP: 00000-000 */
export function formatarCep(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 8);
  if (d.length === 0) {
    return '';
  }
  if (d.length <= 5) {
    return d;
  }
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
}

export function cepSomenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 8);
}

export function isCepValido(valor: string): boolean {
  const d = cepSomenteDigitos(valor);
  if (d.length === 0) {
    return true;
  }
  return d.length === 8;
}

export function formatarCepExibicao(valor: string | null | undefined): string {
  const d = cepSomenteDigitos(valor ?? '');
  if (!d) {
    return '—';
  }
  return formatarCep(d);
}
