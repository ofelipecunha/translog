package com.translog.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmissaoEtiquetaCreateRequest {

	@NotNull(message = "Informe a empresa de origem")
	private Integer codEmpresaOrigem;

	@NotNull(message = "Informe a empresa de destino")
	private Integer codEmpresaDestino;

	@NotBlank(message = "Informe o número do pedido")
	@Size(max = 50, message = "Número do pedido deve ter no máximo 50 caracteres")
	private String numeroPedido;

	@NotNull(message = "Informe a data do pedido")
	private LocalDate dataPedido;

	@NotNull(message = "Informe a quantidade de volumes")
	@Min(value = 1, message = "Quantidade de volumes deve ser no mínimo 1")
	@Max(value = 99, message = "Quantidade de volumes deve ser no máximo 99")
	private Integer quantidadeVolumes;
}
