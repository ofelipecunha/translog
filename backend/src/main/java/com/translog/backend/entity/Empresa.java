package com.translog.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "empresas")
@Getter
@Setter
@NoArgsConstructor
public class Empresa {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "cod_empresa")
	private Integer codEmpresa;

	@Column(name = "razao_social", nullable = false, length = 200)
	private String razaoSocial;

	@Column(name = "nome_fantasia", nullable = false, length = 150)
	private String nomeFantasia;

	@Column(nullable = false, length = 18)
	private String cnpj;

	@Column(length = 150)
	private String email;

	@Column(length = 20)
	private String telefone;

	@Column(length = 255)
	private String endereco;

	@Column(length = 20)
	private String numero;

	@Column(length = 100)
	private String bairro;

	@Column(length = 100)
	private String cidade;

	@Column(length = 2)
	@JdbcTypeCode(SqlTypes.CHAR)
	private String estado;

	@Column(length = 10)
	private String cep;

	@Column(length = 1, nullable = false)
	@JdbcTypeCode(SqlTypes.CHAR)
	private String ativo;

	@Column(name = "data_cadastro", nullable = false)
	private LocalDateTime dataCadastro;
}
