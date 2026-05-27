import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import type { PierreTransacao } from '../../../../core/pierre/pierre.models';
import {
  categoriaTransacaoPierre,
  classeMovimentacaoPierre,
  descricaoTransacaoPierre,
  formatarDataTransacaoPierre,
  formatarValorMovimentacaoPierre,
  paraNumeroTransacao,
  formatarMoedaPierre,
} from '../../../../core/pierre/pierre-transacao-format.util';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-calendario-extrato-dia-modal',
  imports: [NgClass, ModalComponent],
  templateUrl: './calendario-extrato-dia-modal.component.html',
})
export class CalendarioExtratoDiaModalComponent {
  aberto = false;
  dataIso = '';
  dataLabel = '';
  transacoes: PierreTransacao[] = [];
  totalDia = 0;

  abrir(dataIso: string, transacoes: PierreTransacao[]): void {
    this.dataIso = dataIso;
    this.dataLabel = formatarDataTransacaoPierre(dataIso);
    this.transacoes = [...transacoes];
    this.totalDia = transacoes.reduce((acc, t) => acc + paraNumeroTransacao(t.amount), 0);
    this.aberto = true;
  }

  fechar(): void {
    this.aberto = false;
  }

  descricao(txn: PierreTransacao): string {
    return descricaoTransacaoPierre(txn);
  }

  categoria(txn: PierreTransacao): string {
    return categoriaTransacaoPierre(txn);
  }

  valor(txn: PierreTransacao): string {
    return formatarValorMovimentacaoPierre(txn.amount);
  }

  classeValor(txn: PierreTransacao): string {
    return classeMovimentacaoPierre(txn.amount);
  }

  get totalFormatado(): string {
    return formatarMoedaPierre(Math.abs(this.totalDia));
  }
}
