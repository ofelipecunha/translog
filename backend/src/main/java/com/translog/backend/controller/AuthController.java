package com.translog.backend.controller;

import com.translog.backend.auditoria.AuditoriaSuporte;
import com.translog.backend.dto.LoginRequest;
import com.translog.backend.dto.LoginResponse;
import com.translog.backend.dto.PerfilUsuarioResponse;
import com.translog.backend.dto.PerfilUsuarioUpdateRequest;
import com.translog.backend.repository.UsuarioRepository;
import com.translog.backend.service.AuthService;
import com.translog.backend.service.LogAuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;
	private final LogAuditoriaService logAuditoriaService;
	private final UsuarioRepository usuarioRepository;

	@GetMapping
	public Map<String, Object> infoAuth() {
		return Map.of(
				"servico", "translog-auth",
				"loginPost", Map.of(
						"metodo", "POST",
						"url", "/api/auth/login",
						"bodyJson", "{ \"email\": \"...\", \"senha\": \"...\" }"),
				"perfilAtual", Map.of(
						"metodo", "GET",
						"url", "/api/auth/me",
						"cabecalho", "Authorization: Bearer <token>"),
				"atualizarPerfil", Map.of(
						"metodo", "PUT",
						"url", "/api/auth/perfil",
						"cabecalho", "Authorization: Bearer <token>"),
				"uploadImagem", Map.of(
						"metodo", "POST",
						"url", "/api/auth/imagem",
						"cabecalho", "Authorization: Bearer <token>",
						"body", "multipart/form-data, campo file"));
	}

	@GetMapping("/login")
	public ResponseEntity<LoginResponse> loginGet(
			@RequestParam String email,
			@RequestParam String senha,
			HttpServletRequest request) {
		if (email.isBlank() || senha.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe email e senha");
		}
		LoginResponse resposta = authService.login(new LoginRequest(email.trim(), senha));
		registrarLogin(resposta, request);
		return ResponseEntity.ok(resposta);
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(
			@Valid @RequestBody LoginRequest body, HttpServletRequest request) {
		LoginResponse resposta = authService.login(body);
		registrarLogin(resposta, request);
		return ResponseEntity.ok(resposta);
	}

	private void registrarLogin(LoginResponse resposta, HttpServletRequest request) {
		usuarioRepository
				.findById(resposta.getIdLogin())
				.ifPresent(
						u -> logAuditoriaService.registrar(
								u,
								"POST",
								"/api/auth/login",
								"Login no sistema",
								AuditoriaSuporte.extrairIp(request)));
	}

	@GetMapping("/me")
	public ResponseEntity<PerfilUsuarioResponse> perfilAtual(
			@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
		return ResponseEntity.ok(authService.perfilDoToken(authorization));
	}

	@PutMapping("/perfil")
	public ResponseEntity<PerfilUsuarioResponse> atualizarPerfil(
			@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
			@Valid @RequestBody PerfilUsuarioUpdateRequest body) {
		return ResponseEntity.ok(authService.atualizarPerfil(authorization, body));
	}

	@PostMapping(value = "/imagem", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<PerfilUsuarioResponse> uploadImagem(
			@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
			@RequestPart("file") MultipartFile file) {
		return ResponseEntity.ok(authService.atualizarImagemPerfil(authorization, file));
	}
}
