import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { finalize } from 'rxjs';

const LOGIN_REMEMBER_EMAIL_KEY = 'translog_login_email';

@Component({
  selector: 'app-signin-form',
  imports: [
    FormsModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    RouterModule,
  ],
  templateUrl: './signin-form.component.html',
})
export class SigninFormComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  showPassword = false;
  isChecked = true;
  submitting = false;
  loginError = '';
  passwordIncorrect = false;

  email = '';
  password = '';

  constructor() {
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/');
      return;
    }

    try {
      this.email = localStorage.getItem(LOGIN_REMEMBER_EMAIL_KEY) ?? '';
    } catch {
      this.email = '';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    const body = err.error as { message?: unknown } | string | null;
    if (typeof body === 'string' && body.trim().length > 0) {
      return body.trim();
    }

    if (body && typeof body === 'object' && typeof body.message === 'string') {
      return body.message;
    }

    if (err.status === 0) {
      return 'Não foi possível conectar ao backend. Verifique a API e o CORS.';
    }

    if (err.status === 401) {
      return 'Não foi possível entrar. Verifique e-mail e senha.';
    }

    if (err.status === 400) {
      return 'Dados inválidos. Verifique e-mail e senha.';
    }

    if (err.status >= 500) {
      return 'Erro no servidor. Tente novamente em instantes.';
    }

    return `Falha ao entrar (HTTP ${err.status}).`;
  }

  onFieldInput(): void {
    this.clearLoginErrors();
  }

  private clearLoginErrors(): void {
    this.loginError = '';
    this.passwordIncorrect = false;
  }

  onSignIn(): void {
    if (this.submitting) {
      return;
    }

    const email = this.email.trim();
    const senha = this.password;

    if (!email || !senha) {
      this.loginError = 'Informe e-mail e senha.';
      this.passwordIncorrect = false;
      return;
    }

    this.submitting = true;
    this.clearLoginErrors();

    this.authService
      .login(email, senha)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          try {
            if (this.isChecked) {
              localStorage.setItem(LOGIN_REMEMBER_EMAIL_KEY, email);
            } else {
              localStorage.removeItem(LOGIN_REMEMBER_EMAIL_KEY);
            }
          } catch {
            // ignore storage errors
          }
          void this.router.navigateByUrl('/');
        },
        error: (err: unknown) => {
          if (err instanceof HttpErrorResponse) {
            const msg = this.getErrorMessage(err);
            const senhaIncorreta =
              err.status === 401 && msg.toLowerCase().includes('senha incorreta');
            this.passwordIncorrect = senhaIncorreta;
            this.loginError = senhaIncorreta ? '' : msg;
            return;
          }
          this.loginError = 'Erro inesperado ao entrar.';
          this.passwordIncorrect = false;
        },
      });
  }
}
