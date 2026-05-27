package com.translog.backend.controller;

import com.translog.backend.dto.LogAuditoriaDto;
import com.translog.backend.service.AuthService;
import com.translog.backend.service.LogAuditoriaService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
public class LogAuditoriaController {

	private final LogAuditoriaService logAuditoriaService;
	private final AuthService authService;

	@GetMapping("/logs")
	public List<LogAuditoriaDto> listar(
			@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
		var usuario = authService.requireUsuarioPorBearer(authorization);
		String perfil = usuario.getPerfil() != null ? usuario.getPerfil().trim().toUpperCase() : "";
		if (!"ADMIN".equals(perfil)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administradores podem consultar os logs");
		}
		return logAuditoriaService.listarRecentes();
	}
}
