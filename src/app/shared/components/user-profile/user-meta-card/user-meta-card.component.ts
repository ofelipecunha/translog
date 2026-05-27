import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { finalize, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { InputFieldComponent } from './../../form/input/input-field.component';
import { ModalService } from '../../../services/modal.service';

import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';
import { UserSessionProfileService } from '../../../../core/user/user-session-profile.service';
import { UserAvatarComponent } from '../../user/user-avatar/user-avatar.component';
import { formatLocalizacao, labelPerfil } from '../../../../core/user/perfil-usuario.util';

const SOCIAL_EMPTY = {
  facebook: '#',
  x: '#',
  linkedin: '#',
  instagram: '#',
};

@Component({
  selector: 'app-user-meta-card',
  imports: [ModalComponent, InputFieldComponent, ButtonComponent, UserAvatarComponent],
  templateUrl: './user-meta-card.component.html',
  styles: ``,
})
export class UserMetaCardComponent {
  private readonly destroyRef = inject(DestroyRef);

  constructor(public modal: ModalService) {
    this.destroyRef.onDestroy(() => {
      this.revokeIfBlob(this.modalPreviewUrl());
    });
  }

  private readonly token = inject(TokenStorageService);
  private readonly profile = inject(UserSessionProfileService);

  readonly avatarFileInput = viewChild<ElementRef<HTMLInputElement>>('avatarFileInput');

  readonly modalPreviewUrl = signal<string | null>(null);
  readonly pendingAvatarFile = signal<File | null>(null);
  readonly avatarModalOpen = signal(false);
  readonly avatarUploading = signal(false);
  readonly avatarUploadError = signal<string | null>(null);

  isOpen = false;
  openModal() {
    this.isOpen = true;
  }
  closeModal() {
    this.isOpen = false;
  }

  readonly avatarImagem = computed(() => {
    const p = this.profile.profile();
    const s = this.token.getUser();
    return p?.imagem ?? s?.imagem ?? null;
  });

  readonly user = computed(() => {
    const p = this.profile.profile();
    const s = this.token.getUser();
    if (p) {
      return {
        firstName: p.nome,
        lastName: '',
        role: labelPerfil(p.perfil),
        location: formatLocalizacao(p.cidade, p.estado),
        social: { ...SOCIAL_EMPTY },
        email: p.email,
        phone: p.telefone ?? '—',
        bio: '—',
      };
    }
    if (s) {
      return {
        firstName: s.nome,
        lastName: '',
        role: '—',
        location: '—',
        social: { ...SOCIAL_EMPTY },
        email: s.email,
        phone: '—',
        bio: '—',
      };
    }
    return {
      firstName: '—',
      lastName: '',
      role: '—',
      location: '—',
      social: { ...SOCIAL_EMPTY },
      email: '',
      phone: '—',
      bio: '—',
    };
  });

  openAvatarModal(): void {
    this.avatarUploadError.set(null);
    this.revokeIfBlob(this.modalPreviewUrl());
    this.modalPreviewUrl.set(null);
    this.pendingAvatarFile.set(null);
    this.avatarModalOpen.set(true);
    queueMicrotask(() => {
      const el = this.avatarFileInput()?.nativeElement;
      if (el) {
        el.value = '';
      }
    });
  }

  closeAvatarModal(): void {
    this.avatarUploadError.set(null);
    this.revokeIfBlob(this.modalPreviewUrl());
    this.modalPreviewUrl.set(null);
    this.pendingAvatarFile.set(null);
    this.avatarModalOpen.set(false);
  }

  onAvatarFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    this.avatarUploadError.set(null);
    this.revokeIfBlob(this.modalPreviewUrl());
    this.pendingAvatarFile.set(file);
    this.modalPreviewUrl.set(URL.createObjectURL(file));
  }

  confirmAvatarSelection(): void {
    const file = this.pendingAvatarFile();
    if (!file) {
      this.closeAvatarModal();
      return;
    }
    this.avatarUploading.set(true);
    this.avatarUploadError.set(null);
    this.profile
      .uploadAvatar(file)
      .pipe(
        switchMap(() => this.profile.refreshProfile()),
        finalize(() => this.avatarUploading.set(false)),
      )
      .subscribe({
        next: () => {
          this.revokeIfBlob(this.modalPreviewUrl());
          this.modalPreviewUrl.set(null);
          this.pendingAvatarFile.set(null);
          this.avatarModalOpen.set(false);
        },
        error: (err: unknown) => {
          let msg = 'Não foi possível enviar a imagem. Tente outra foto ou mais tarde.';
          if (err instanceof HttpErrorResponse) {
            if (err.status === 413 || err.status === 400) {
              msg =
                'O ficheiro é demasiado grande para o servidor (máx. 25 MB) ou o pedido foi rejeitado. Reinicie o backend após atualizar limites, ou escolha uma imagem mais pequena.';
            }
          }
          this.avatarUploadError.set(msg);
        },
      });
  }

  triggerAvatarFilePicker(): void {
    this.avatarFileInput()?.nativeElement.click();
  }

  handleSave() {
    this.modal.closeModal();
  }

  private revokeIfBlob(url: string | null): void {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}
