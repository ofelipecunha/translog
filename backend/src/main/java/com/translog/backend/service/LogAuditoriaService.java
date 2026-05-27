package com.translog.backend.service;

import com.translog.backend.dto.LogAuditoriaDto;
import com.translog.backend.entity.LogAuditoria;
import com.translog.backend.entity.Usuario;
import com.translog.backend.repository.LogAuditoriaRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LogAuditoriaService {

	private static final Logger log = LoggerFactory.getLogger(LogAuditoriaService.class);

	private final LogAuditoriaRepository logAuditoriaRepository;

	@Value("${app.auditoria.habilitado:true}")
	private boolean habilitado;

	@Value("${app.auditoria.retencao-horas:1}")
	private int retencaoHoras;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void registrar(Usuario usuario, String metodo, String rota, String acao, String ip) {
		if (!habilitado) {
			return;
		}
		LogAuditoria entry = new LogAuditoria();
		if (usuario != null) {
			entry.setIdUsuario(usuario.getIdUsuario());
			entry.setNome(usuario.getNome());
			entry.setEmail(usuario.getEmail());
		} else {
			entry.setNome("—");
			entry.setEmail("—");
		}
		entry.setMetodo(truncar(metodo, 10));
		entry.setRota(truncar(rota, 500));
		entry.setAcao(truncar(acao, 500));
		entry.setIp(truncar(ip, 64));
		entry.setCriadoEm(LocalDateTime.now());
		logAuditoriaRepository.save(entry);
	}

	@Transactional(readOnly = true)
	public List<LogAuditoriaDto> listarRecentes() {
		return logAuditoriaRepository.findTop200ByOrderByCriadoEmDesc().stream()
				.map(LogAuditoriaService::toDto)
				.toList();
	}

	@Scheduled(cron = "${app.auditoria.limpeza-cron:0 0 * * * *}")
	@Transactional
	public void expurgarAntigos() {
		if (!habilitado) {
			return;
		}
		LocalDateTime limite = LocalDateTime.now().minusHours(Math.max(1, retencaoHoras));
		int removidos = logAuditoriaRepository.deleteByCriadoEmBefore(limite);
		if (removidos > 0) {
			log.info("Auditoria: {} registro(s) removido(s) (mais antigos que {} h)", removidos, retencaoHoras);
		}
	}

	private static LogAuditoriaDto toDto(LogAuditoria l) {
		return LogAuditoriaDto.builder()
				.idLog(l.getIdLog())
				.idUsuario(l.getIdUsuario())
				.nome(l.getNome())
				.email(l.getEmail())
				.metodo(l.getMetodo())
				.rota(l.getRota())
				.acao(l.getAcao())
				.ip(l.getIp())
				.criadoEm(l.getCriadoEm())
				.build();
	}

	private static String truncar(String valor, int max) {
		if (valor == null) {
			return "";
		}
		String t = valor.trim();
		return t.length() <= max ? t : t.substring(0, max);
	}
}
