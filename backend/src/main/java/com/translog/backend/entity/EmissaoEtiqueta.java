package com.translog.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "emissao_etiquetas")
@Getter
@Setter
@NoArgsConstructor
public class EmissaoEtiqueta {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_emissao")
	private Integer idEmissao;

	@Column(name = "cod_empresa_origem", nullable = false)
	private Integer codEmpresaOrigem;

	@Column(name = "cod_empresa_destino", nullable = false)
	private Integer codEmpresaDestino;

	@Column(name = "numero_pedido", nullable = false, length = 50)
	private String numeroPedido;

	@Column(name = "data_pedido", nullable = false)
	private LocalDate dataPedido;

	@Column(name = "quantidade_volumes", nullable = false)
	private Integer quantidadeVolumes;

	@Column(nullable = false, length = 30)
	private String status;

	@Column(name = "data_emissao", nullable = false)
	private LocalDateTime dataEmissao;
}
