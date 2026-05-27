import { Component } from '@angular/core';
import { TransportPageShellComponent } from '../transport-page-shell/transport-page-shell.component';

@Component({
  selector: 'app-rotas-page',
  imports: [TransportPageShellComponent],
  template: `
    <app-transport-page-shell
      pageTitle="Rotas"
      cardTitle="Planejamento de rotas"
      description="Organize rotas, paradas e otimização de entregas por região e prioridade."
    />
  `,
})
export class RotasPageComponent {}
