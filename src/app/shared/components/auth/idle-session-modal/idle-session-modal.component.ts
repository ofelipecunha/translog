import { Component, inject } from '@angular/core';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { IdleSessionService } from '../../../../core/auth/idle-session.service';

@Component({
  selector: 'app-idle-session-modal',
  imports: [ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="idle.sessionExpired()"
      [showCloseButton]="false"
      [closeOnBackdrop]="false"
      [closeOnEscape]="false"
      className="max-w-md m-4"
    >
      <div class="rounded-3xl bg-white p-6 text-center dark:bg-gray-900 sm:p-8">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400"
          aria-hidden="true"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">Sessão encerrada</h3>
        <p class="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Você ficou mais de 30 minutos sem usar o sistema. Por segurança, é necessário fazer login
          novamente.
        </p>
        <app-button size="sm" className="w-full justify-center" (btnClick)="refazerLogin()">
          Fazer login novamente
        </app-button>
      </div>
    </app-modal>
  `,
})
export class IdleSessionModalComponent {
  readonly idle = inject(IdleSessionService);
  private readonly auth = inject(AuthService);

  refazerLogin(): void {
    this.idle.clearExpiredState();
    this.idle.stopMonitoring();
    this.auth.logout();
  }
}
