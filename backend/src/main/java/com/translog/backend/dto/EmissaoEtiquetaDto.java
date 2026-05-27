package com.translog.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmissaoEtiquetaDto {

	private Integer idEmissao;
	private Integer codEmpresaOrigem;
	private Integer codEmpresaDestino;
	private String numeroPedido;
	private LocalDate dataPedido;
	private Integer quantidadeVolumes;
	private String status;
	private LocalDateTime dataEmissao;
	private List<EmissaoEtiquetaVolumeDto> volumes;
}
