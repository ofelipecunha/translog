import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { SelectComponent, Option } from '../../form/select/select.component';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';
import { UserSessionProfileService } from '../../../../core/user/user-session-profile.service';
import { BRASIL_ESTADOS } from '../../../../core/geo/brasil-estados';
import { IbgeLocalidadeService } from '../../../../core/geo/ibge-localidade.service';
import { formatLocalizacao, labelEstado } from '../../../../core/user/perfil-usuario.util';

@Component({
  selector: 'app-user-address-card',
  imports: [InputFieldComponent, ButtonComponent, LabelComponent, ModalComponent, SelectComponent],
  templateUrl: './user-address-card.component.html',
  styles: ``,
})
export class UserAddressCardComponent {
  private readonly profile = inject(UserSessionProfileService);
  private readonly token = inject(TokenStorageService);
  private readonly ibge = inject(IbgeLocalidadeService);

  readonly estadoOptions: Option[] = BRASIL_ESTADOS.map((e) => ({
    value: e.sigla,
    label: `${e.nome} (${e.sigla})`,
  }));

  isOpen = false;
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly loadingCidades = signal(false);

  readonly formEndereco = signal('');
  readonly formEstado = signal('');
  readonly formCidade = signal('');
  readonly cidadeOptions = signal<Option[]>([]);

  readonly address = computed(() => {
    const p = this.profile.profile();
    if (p) {
      return {
        endereco: p.endereco?.trim() || '—',
        estado: p.estado ? labelEstado(p.estado) : '—',
        cidade: p.cidade?.trim() || '—',
        resumo: formatLocalizacao(p.cidade, p.estado),
      };
    }
    if (this.token.getUser()) {
      return {
        endereco: '—',
        estado: '—',
        cidade: '—',
        resumo: '—',
      };
    }
    return {
      endereco: '—',
      estado: '—',
      cidade: '—',
      resumo: '—',
    };
  });

  openModal(): void {
    const p = this.profile.profile();
    this.formEndereco.set(p?.endereco ?? '');
    const uf = p?.estado?.trim().toUpperCase() ?? '';
    this.formEstado.set(uf);
    this.formCidade.set(p?.cidade ?? '');
    this.saveError.set(null);
    this.isOpen = true;
    if (uf) {
      this.carregarCidades(uf, p?.cidade ?? '');
    } else {
      this.cidadeOptions.set([]);
    }
  }

  closeModal(): void {
    this.isOpen = false;
  }

  onEstadoChange(uf: string): void {
    this.formEstado.set(uf);
    this.formCidade.set('');
    this.carregarCidades(uf);
  }

  onCidadeChange(nome: string): void {
    this.formCidade.set(nome);
  }

  private carregarCidades(uf: string, cidadeAtual?: string): void {
    this.loadingCidades.set(true);
    this.ibge.municipiosComoOpcoes(uf).subscribe({
      next: (opts) => {
        this.cidadeOptions.set(opts);
        if (cidadeAtual && opts.some((o) => o.value === cidadeAtual)) {
          this.formCidade.set(cidadeAtual);
        }
        this.loadingCidades.set(false);
      },
      error: () => {
        this.cidadeOptions.set([]);
        this.loadingCidades.set(false);
        this.saveError.set('Não foi possível carregar as cidades. Verifique sua conexão.');
      },
    });
  }

  handleSave(): void {
    const estado = this.formEstado().trim().toUpperCase();
    if (estado && !this.formCidade().trim()) {
      this.saveError.set('Selecione a cidade para o estado escolhido.');
      return;
    }
    this.saving.set(true);
    this.saveError.set(null);
    this.profile
      .updatePerfil({
        endereco: this.formEndereco().trim() || undefined,
        estado: estado || undefined,
        cidade: this.formCidade().trim() || undefined,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.closeModal(),
        error: () => {
          this.saveError.set('Não foi possível salvar o endereço. Tente novamente.');
        },
      });
  }
}
