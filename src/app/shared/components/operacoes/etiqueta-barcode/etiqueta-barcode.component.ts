import {
  Component,
  ElementRef,
  afterNextRender,
  effect,
  input,
  viewChild,
} from '@angular/core';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-etiqueta-barcode',
  template: `
    <svg
      #svg
      class="mx-auto block h-auto w-full max-w-full"
      role="img"
      [attr.aria-label]="'Código de barras ' + value()"
    ></svg>
  `,
})
export class EtiquetaBarcodeComponent {
  readonly value = input.required<string>();

  private readonly svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svg');

  constructor() {
    afterNextRender(() => this.desenhar());
    effect(() => {
      this.value();
      this.desenhar();
    });
  }

  private desenhar(): void {
    const el = this.svgRef()?.nativeElement;
    if (!el) {
      return;
    }

    const texto = this.value().trim();
    if (!texto) {
      el.replaceChildren();
      return;
    }

    try {
      JsBarcode(el, texto, {
        format: 'CODE128',
        displayValue: false,
        height: 72,
        width: 2,
        margin: 6,
        background: 'transparent',
        lineColor: '#111827',
      });
    } catch {
      el.replaceChildren();
    }
  }
}
