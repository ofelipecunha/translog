package com.translog.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

	/** E-mail ou login do usuário. */
	@NotBlank(message = "Informe o e-mail ou login")
	private String email;

	@NotBlank(message = "Senha é obrigatória")
	@JsonAlias({ "password" })
	private String senha;
}
