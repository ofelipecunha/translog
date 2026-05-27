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
public class EmpresaDto {

	private Integer codEmpresa;
	private String razaoSocial;
	private String nomeFantasia;
	private String cnpj;
	private String email;
	private String telefone;
	private String endereco;
	private String numero;
	private String bairro;
	private String cidade;
	private String estado;
	private String cep;
	private String ativo;
	private LocalDateTime dataCadastro;
}
