import { Component, effect, inject, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AuthService } from '../../../../core/auth/auth.service';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';
import { UserSessionProfileService } from '../../../../core/user/user-session-profile.service';
import { UserAvatarComponent } from '../../user/user-avatar/user-avatar.component';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemTwoComponent, UserAvatarComponent],
})
export class UserDropdownComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly sessionProfile = inject(UserSessionProfileService);

  isOpen = false;

  headerNome = '';
  headerImagem: string | null = null;
  dropdownNomeCompleto = '';
  dropdownEmail = '';

  constructor() {
    effect(() => {
      const p = this.sessionProfile.profile();
      if (p) {
        this.headerNome = p.nome;
        this.headerImagem = p.imagem ?? null;
        this.dropdownNomeCompleto = p.nome;
        this.dropdownEmail = p.email;
      } else {
        this.syncFromSession();
      }
    });
  }

  ngOnInit(): void {
    this.syncFromSession();
    if (!this.tokenStorage.hasToken()) {
      return;
    }
    this.sessionProfile.load().subscribe({
      next: (p) => {
        this.tokenStorage.patchUser({
          nome: p.nome,
          imagem: p.imagem ?? undefined,
        });
      },
      error: () => {
        /* mantém dados da sessão (login) */
      },
    });
  }

  private syncFromSession(): void {
    const u = this.tokenStorage.getUser();
    if (!u) {
      return;
    }
    this.headerNome = u.nome;
    this.headerImagem = u.imagem ?? null;
    this.dropdownNomeCompleto = u.nome;
    this.dropdownEmail = u.email;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  onSignOut(event: Event) {
    event.preventDefault();
    this.closeDropdown();
    this.authService.logout();
  }
}
