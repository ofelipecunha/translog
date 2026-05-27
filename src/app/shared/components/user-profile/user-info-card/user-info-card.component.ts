import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';
import { UserSessionProfileService } from '../../../../core/user/user-session-profile.service';
import { labelPerfil } from '../../../../core/user/perfil-usuario.util';

@Component({
  selector: 'app-user-info-card',
  imports: [InputFieldComponent, ButtonComponent, LabelComponent, ModalComponent],
  templateUrl: './user-info-card.component.html',
  styles: ``,
})
export class UserInfoCardComponent {
  private readonly profile = inject(UserSessionProfileService);
  private readonly token = inject(TokenStorageService);

  isOpen = false;
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly formNome = signal('');
  readonly formTelefone = signal('');

  readonly user = computed(() => {
    const p = this.profile.profile();
    const s = this.token.getUser();
    if (p) {
      return {
        nome: p.nome,
        email: p.email,
        telefone: p.telefone?.trim() || '—',
        perfil: labelPerfil(p.perfil),
      };
    }
    if (s) {
      return {
        nome: s.nome,
        email: s.email,
        telefone: '—',
        perfil: '—',
      };
    }
    return {
      nome: '—',
      email: '—',
      telefone: '—',
      perfil: '—',
    };
  });

  openModal(): void {
    const p = this.profile.profile();
    this.formNome.set(p?.nome ?? this.token.getUser()?.nome ?? '');
    this.formTelefone.set(p?.telefone ?? '');
    this.saveError.set(null);
    this.isOpen = true;
  }

  closeModal(): void {
    this.isOpen = false;
  }

  handleSave(): void {
    const nome = this.formNome().trim();
    if (!nome) {
      this.saveError.set('Informe o nome.');
      return;
    }
    this.saving.set(true);
    this.saveError.set(null);
    this.profile
      .updatePerfil({
        nome,
        telefone: this.formTelefone().trim() || undefined,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.closeModal(),
        error: (err: unknown) => {
          const msg =
            err instanceof HttpErrorResponse && err.error && typeof err.error === 'object' && 'message' in err.error
              ? String((err.error as { message: string }).message)
              : 'Não foi possível salvar. Tente novamente.';
          this.saveError.set(msg);
        },
      });
  }
}
