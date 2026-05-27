import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-cadastro-actions',
  templateUrl: './form-cadastro-actions.component.html',
})
export class FormCadastroActionsComponent {
  @Input() cancelDisabled = false;
  @Input() salvarDisabled = false;
  @Input() salvando = false;

  @Output() readonly cancelar = new EventEmitter<void>();
  @Output() readonly salvar = new EventEmitter<void>();
}
