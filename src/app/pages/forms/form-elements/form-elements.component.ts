
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertNotificationService } from '../../../shared/services/alert-notification.service';
import { FormCadastroActionsComponent } from '../../../shared/components/form/form-cadastro-actions/form-cadastro-actions.component';
import {
  PageBreadcrumbComponent,
  type PageBreadcrumbTrailItem,
} from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DefaultInputsComponent } from '../../../shared/components/form/form-elements/default-inputs/default-inputs.component';
import { SelectInputsComponent } from '../../../shared/components/form/form-elements/select-inputs/select-inputs.component';
import { TextAreaInputComponent } from '../../../shared/components/form/form-elements/text-area-input/text-area-input.component';
import { InputStatesComponent } from '../../../shared/components/form/form-elements/input-states/input-states.component';
import { InputGroupComponent } from '../../../shared/components/form/form-elements/input-group/input-group.component';
import { FileInputExampleComponent } from '../../../shared/components/form/form-elements/file-input-example/file-input-example.component';
import { CheckboxComponentsComponent } from '../../../shared/components/form/form-elements/checkbox-components/checkbox-components.component';
import { RadioButtonsComponent } from '../../../shared/components/form/form-elements/radio-buttons/radio-buttons.component';
import { ToggleSwitchComponent } from '../../../shared/components/form/form-elements/toggle-switch/toggle-switch.component';
import { DropzoneComponent } from '../../../shared/components/form/form-elements/dropzone/dropzone.component';

@Component({
  selector: 'app-form-elements',
  imports: [
    PageBreadcrumbComponent,
    FormCadastroActionsComponent,
    DefaultInputsComponent,
    SelectInputsComponent,
    TextAreaInputComponent,
    InputStatesComponent,
    InputGroupComponent,
    FileInputExampleComponent,
    CheckboxComponentsComponent,
    RadioButtonsComponent,
    ToggleSwitchComponent,
    DropzoneComponent
],
  templateUrl: './form-elements.component.html',
  styles: ``
})
export class FormElementsComponent {
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertNotificationService);

  readonly breadcrumbTrail: PageBreadcrumbTrailItem[] = [
    { label: 'Lançamentos' },
    { label: 'Form Elements', link: '/form-elements' },
  ];

  salvar(): void {
    this.alerts.success('Salvo', 'Cadastro salvo com sucesso.');
    this.router.navigate(['/form-elements']);
  }

  cancelar(): void {
    this.router.navigate(['/form-elements']);
  }
}
