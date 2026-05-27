import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EcommerceMetricsComponent } from '../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import type { PierreBancoExibicao } from '../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';

@Component({
  selector: 'app-bancos-page',
  imports: [EcommerceMetricsComponent],
  template: `
    <div class="mx-auto max-w-[1536px]">
      <h1 class="mb-1 text-xl font-semibold text-gray-800 dark:text-white/90 md:text-2xl">
        {{ titulo }}
      </h1>
      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {{ subtitulo }}
      </p>
      <app-ecommerce-metrics [bancoExibido]="bancoExibido" />
    </div>
  `,
})
export class BancosPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly bancoExibido = (this.route.snapshot.data['banco'] as PierreBancoExibicao | undefined) ?? 'nubank';

  readonly titulo =
    this.bancoExibido === 'bb' ? 'Banco do Brasil' : this.bancoExibido === 'nubank' ? 'Nubank' : 'Bancos';

  readonly subtitulo =
    this.bancoExibido === 'bb'
      ? 'Saldo e extrato do Banco do Brasil via API Pierre.'
      : 'Saldo e extrato do Nubank via API Pierre.';
}
