package com.translog.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PerfilUsuarioUpdateRequest {

	@Size(max = 150)
	private String nome;

	@Size(max = 20)
	private String telefone;

	@Size(max = 255)
	private String endereco;

	@Size(max = 100)
	private String cidade;

	@Size(min = 2, max = 2)
	private String estado;
}
