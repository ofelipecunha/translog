import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Option {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  imports: [FormsModule],
  templateUrl: './select.component.html',
})
export class SelectComponent {
  @Input() options: Option[] = [];
  @Input() placeholder = 'Selecione uma opção';
  @Input() className = '';
  @Input() value = '';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  onModelChange(next: string): void {
    this.valueChange.emit(next);
  }
}
