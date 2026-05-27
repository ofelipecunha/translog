import { Component } from '@angular/core';
import { TransportPageShellComponent } from '../transport-page-shell/transport-page-shell.component';

@Component({
  selector: 'app-motoristas-page',
  imports: [TransportPageShellComponent],
  template: `
    <app-transport-page-shell
      pageTitle="Motoristas"
      cardTitle="Equipe de motoristas"
      description="Gerencie motoristas, CNH, escala de viagens e histórico de entregas realizadas."
    />
  `,
})
export class MotoristasPageComponent {}
