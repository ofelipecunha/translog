package com.translog.backend.controller;

import com.translog.backend.dto.UsuarioCreateRequest;
import com.translog.backend.dto.UsuarioDto;
import com.translog.backend.dto.UsuarioUpdateRequest;
import com.translog.backend.service.UsuarioAdminService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

	private final UsuarioAdminService usuarioAdminService;

	@GetMapping
	public List<UsuarioDto> listar(@RequestParam(required = false) String nome) {
		return usuarioAdminService.listar(nome);
	}

	@GetMapping("/{id}")
	public UsuarioDto buscar(@PathVariable Integer id) {
		return usuarioAdminService.buscarPorId(id);
	}

	@PostMapping
	public ResponseEntity<UsuarioDto> criar(@Valid @RequestBody UsuarioCreateRequest body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(usuarioAdminService.criar(body));
	}

	@PutMapping("/{id}")
	public UsuarioDto atualizar(@PathVariable Integer id, @Valid @RequestBody UsuarioUpdateRequest body) {
		return usuarioAdminService.atualizar(id, body);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> excluir(@PathVariable Integer id) {
		usuarioAdminService.excluir(id);
		return ResponseEntity.noContent().build();
	}
}
