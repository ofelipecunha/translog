package com.translog.backend.dto;

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
public class PerfilUsuarioResponse {

	private Integer idLogin;
	private String nome;
	private String login;
	private String email;
	private String endereco;
	private String cidade;
	private String estado;
	private String telefone;
	private String imagem;
	private String perfil;
}
