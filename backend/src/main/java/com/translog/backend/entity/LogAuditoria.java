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

@Entity
@Table(name = "log_auditoria")
@Getter
@Setter
@NoArgsConstructor
public class LogAuditoria {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_log")
	private Long idLog;

	@Column(name = "id_usuario")
	private Integer idUsuario;

	@Column(length = 150)
	private String nome;

	@Column(length = 150)
	private String email;

	@Column(nullable = false, length = 10)
	private String metodo;

	@Column(nullable = false, length = 500)
	private String rota;

	@Column(nullable = false, length = 500)
	private String acao;

	@Column(length = 64)
	private String ip;

	@Column(name = "criado_em", nullable = false)
	private LocalDateTime criadoEm;
}
