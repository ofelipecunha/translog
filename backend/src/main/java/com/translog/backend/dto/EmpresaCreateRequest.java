package com.translog.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmpresaCreateRequest {

	@NotBlank(message = "Informe a razão social")
	@Size(max = 200)
	private String razaoSocial;

	@NotBlank(message = "Informe o nome fantasia")
	@Size(max = 150)
	private String nomeFantasia;

	@NotBlank(message = "Informe o CNPJ")
	@Size(max = 18)
	private String cnpj;

	@Email(message = "E-mail inválido")
	@Size(max = 150)
	private String email;

	@Size(max = 20)
	private String telefone;

	@Size(max = 255)
	private String endereco;

	@Size(max = 20)
	private String numero;

	@Size(max = 100)
	private String bairro;

	@Size(max = 100)
	private String cidade;

	@Size(max = 2)
	private String estado;

	@Size(max = 10)
	private String cep;

	@Pattern(regexp = "[SN]", message = "Ativo deve ser S ou N")
	private String ativo;
}
