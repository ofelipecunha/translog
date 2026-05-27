package com.translog.backend.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class LogAuditoriaDto {
	Long idLog;
	Integer idUsuario;
	String nome;
	String email;
	String metodo;
	String rota;
	String acao;
	String ip;
	LocalDateTime criadoEm;
}
