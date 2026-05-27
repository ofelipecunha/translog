import { Component } from '@angular/core';
import { TransportPageShellComponent } from '../transport-page-shell/transport-page-shell.component';

@Component({
  selector: 'app-veiculos-page',
  imports: [TransportPageShellComponent],
  template: `
    <app-transport-page-shell
      pageTitle="Veículos"
      cardTitle="Frota de veículos"
      description="Controle caminhões, carretas e utilitários da frota, com status de disponibilidade, manutenção e documentação."
    />
  `,
})
export class VeiculosPageComponent {}
