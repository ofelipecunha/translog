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
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_usuario")
	private Integer idUsuario;

	@Column(nullable = false, length = 150)
	private String nome;

	@Column(nullable = false, unique = true, length = 80)
	private String login;

	@Column(name = "senha_hash", nullable = false, length = 255)
	private String senhaHash;

	@Column(length = 500)
	private String token;

	@Column(nullable = false, unique = true, length = 150)
	private String email;

	@Column(length = 255)
	private String endereco;

	@Column(length = 100)
	private String cidade;

	@Column(name = "estado", length = 2)
	@JdbcTypeCode(SqlTypes.CHAR)
	private String estado;

	@Column(length = 20)
	private String telefone;

	@Column(name = "imagem_url", length = 500)
	private String imagemUrl;

	@Column(length = 30)
	private String perfil;

	@Column(length = 1)
	@JdbcTypeCode(SqlTypes.CHAR)
	private String ativo;

	@Column(name = "data_cadastro", nullable = false)
	private LocalDateTime dataCadastro;
}
