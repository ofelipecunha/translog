package com.translog.backend.dto;

import java.time.LocalDateTime;
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
public class UsuarioDto {

	private Integer idUsuario;
	private String nome;
	private String login;
	private String email;
	private String telefone;
	private String perfil;
	private String ativo;
	private String endereco;
	private String cidade;
	private String estado;
	private LocalDateTime dataCadastro;
}
