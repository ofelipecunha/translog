import { Component, Input } from '@angular/core';

export type VirtualCreditCardVariant = 'nubank' | 'bb';

@Component({
  selector: 'app-virtual-credit-card',
  templateUrl: './virtual-credit-card.component.html',
  styles: `
    .virtual-card {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      width: 100%;
      max-width: 17.5rem;
      margin-inline: auto;
      border-radius: 1.125rem;
      aspect-ratio: 1.586 / 1;
      min-height: 9.25rem;
      padding: 0.95rem 1.1rem;
      box-shadow:
        0 14px 28px -10px rgb(0 0 0 / 0.32),
        inset 0 1px 0 rgb(255 255 255 / 0.1);
    }

    .virtual-card--nubank {
      background: #820ad1;
      color: #fff;
    }

    .virtual-card--bb {
      background: #fdfc30;
      color: #1a1a1a;
    }

    .virtual-card__contactless {
      width: 1.35rem;
      height: 1.35rem;
      opacity: 0.95;
    }

    .virtual-card__title {
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      opacity: 0.92;
    }

    .virtual-card__logo {
      display: block;
      width: auto;
      max-width: 5.5rem;
      height: 1.35rem;
      object-fit: contain;
      object-position: right center;
    }

    .virtual-card--bb .virtual-card__logo {
      max-width: 2.25rem;
      height: 1.5rem;
    }

    .virtual-card__number {
      margin: 0;
      font-size: clamp(0.95rem, 2.6vw, 1.1rem);
      font-weight: 600;
      letter-spacing: 0.04em;
      line-height: 1.3;
    }

    .virtual-card__chip {
      width: 2.15rem;
      height: 1.6rem;
      border-radius: 0.32rem;
      background: linear-gradient(145deg, #e8d5a3 0%, #c9a227 45%, #f5e6b8 55%, #b8860b 100%);
      border: 1px solid rgb(255 255 255 / 0.35);
      box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.2);
    }

    .virtual-card__chip-lines {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      padding: 5px 6px;
      height: 100%;
    }

    .virtual-card__chip-lines span {
      display: block;
      border-radius: 1px;
      background: rgb(0 0 0 / 0.18);
    }

    .virtual-card__holder {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      opacity: 0.95;
    }

    .virtual-card__expiry {
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.9;
    }
  `,
})
export class VirtualCreditCardComponent {
  @Input() variant: VirtualCreditCardVariant = 'nubank';
  @Input() balanceValue = '—';
  @Input() masked = false;
  @Input() cardNumber = '5282 3456 7890 1289';
  @Input() expiry = '09/25';
  @Input() titular = '';

  /** Mantido por compatibilidade com o pai; não exibido no layout do modelo. */
  @Input() balanceLabel = '';

  get logoSrc(): string {
    return this.variant === 'bb'
      ? '/images/logos/bb-card-logo.svg'
      : '/images/logos/nubank-card-logo.svg';
  }

  get logoAlt(): string {
    return this.variant === 'bb' ? 'Banco do Brasil' : 'Nubank';
  }

  get titularExibido(): string {
    if (this.titular.trim()) {
      return this.titular;
    }
    return this.variant === 'bb' ? 'Banco do Brasil' : 'Nubank';
  }

  get balanceExibido(): string {
    if (this.masked && this.balanceValue !== '—' && this.balanceValue !== '…') {
      return 'R$ •••,••';
    }
    return this.balanceValue;
  }

  get numeroExibido(): string {
    if (this.masked) {
      return '•••• •••• •••• ••••';
    }
    return this.cardNumber;
  }
}
