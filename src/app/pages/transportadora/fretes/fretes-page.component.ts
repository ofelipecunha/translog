import { Component } from '@angular/core';
import { TransportPageShellComponent } from '../transport-page-shell/transport-page-shell.component';

@Component({
  selector: 'app-fretes-page',
  imports: [TransportPageShellComponent],
  template: `
    <app-transport-page-shell
      pageTitle="Fretes"
      cardTitle="Gestão de fretes"
      description="Cadastre, acompanhe e gerencie todos os fretes da transportadora. Esta área será integrada com o backend de operações logísticas."
    />
  `,
})
export class FretesPageComponent {}
