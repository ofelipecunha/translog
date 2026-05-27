import { Component } from '@angular/core';
import { TransportPageShellComponent } from '../transport-page-shell/transport-page-shell.component';

@Component({
  selector: 'app-clientes-page',
  imports: [TransportPageShellComponent],
  template: `
    <app-transport-page-shell
      pageTitle="Clientes"
      cardTitle="Base de clientes"
      description="Cadastro de empresas e contratos de transporte, com histórico de fretes e faturamento."
    />
  `,
})
export class ClientesPageComponent {}
