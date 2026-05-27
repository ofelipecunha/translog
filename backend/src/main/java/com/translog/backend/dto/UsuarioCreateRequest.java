package com.translog.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioCreateRequest {

	@NotBlank(message = "Informe o nome")
	@Size(max = 150)
	private String nome;

	@NotBlank(message = "Informe o login")
	@Size(max = 80)
	private String login;

	@NotBlank(message = "Informe o e-mail")
	@Email(message = "E-mail inválido")
	@Size(max = 150)
	private String email;

	@NotBlank(message = "Informe a senha")
	@Size(min = 6, max = 100, message = "A senha deve ter entre 6 e 100 caracteres")
	private String senha;

	@Size(max = 20)
	private String telefone;

	@NotBlank(message = "Informe o perfil")
	@Pattern(
			regexp = "ADMIN|OPERADOR|MOTORISTA|CLIENTE|USUARIO",
			message = "Perfil inválido")
	private String perfil;

	@Pattern(regexp = "[SN]", message = "Ativo deve ser S ou N")
	private String ativo;
}
