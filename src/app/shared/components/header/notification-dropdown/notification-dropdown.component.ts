import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';

type StatusOperacao = 'transito' | 'andamento' | 'aguardando';

interface NotificacaoOperacao {
  id: string;
  titulo: string;
  detalhe: string;
  resumo?: string;
  statusLabel: string;
  status: StatusOperacao;
  tempo: string;
  rota: string;
  usarIconeCaminhao?: boolean;
}

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  imports: [NgClass, RouterModule, DropdownComponent],
})
export class NotificationDropdownComponent {
  isOpen = false;
  notifying = true;

  readonly notificacoes: NotificacaoOperacao[] = [
    {
      id: '1',
      titulo: 'Rotas do dia',
      detalhe: 'Loja 01 - Matriz → Loja 02 - Centro',
      resumo: '12 pedidos · 28 volumes',
      statusLabel: 'Em trânsito',
      status: 'transito',
      tempo: 'Agora',
      rota: '/operacoes/rota',
      usarIconeCaminhao: true,
    },
    {
      id: '2',
      titulo: 'Controle de Carga e Descarga',
      detalhe: 'Embarque — Loja 01 - Matriz',
      resumo: '8 volumes aguardando leitura',
      statusLabel: 'Em andamento',
      status: 'andamento',
      tempo: '12 min',
      rota: '/operacoes/carga-descarga',
    },
    {
      id: '3',
      titulo: 'Conferência de Vol.',
      detalhe: 'Pedido 4587',
      resumo: '2 volumes com divergência',
      statusLabel: 'Em andamento',
      status: 'andamento',
      tempo: '25 min',
      rota: '/operacoes/conferencia-volumes',
    },
  ];

  readonly itemClassName =
    'w-full text-left text-sm flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 last:border-0';

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.notifying = false;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  classeStatus(status: StatusOperacao): string {
    switch (status) {
      case 'transito':
        return 'text-brand-600 dark:text-brand-400';
      case 'aguardando':
        return 'text-warning-600 dark:text-warning-400';
      case 'andamento':
        return 'text-success-600 dark:text-success-400';
    }
  }

  classeIconeBg(status: StatusOperacao): string {
    switch (status) {
      case 'transito':
        return 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400';
      case 'aguardando':
        return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400';
      case 'andamento':
        return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400';
    }
  }
}
