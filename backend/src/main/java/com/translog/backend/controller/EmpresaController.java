package com.translog.backend.controller;

import com.translog.backend.dto.EmpresaCreateRequest;
import com.translog.backend.dto.EmpresaDto;
import com.translog.backend.dto.EmpresaUpdateRequest;
import com.translog.backend.service.EmpresaService;
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
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
public class EmpresaController {

	private final EmpresaService empresaService;

	@GetMapping
	public List<EmpresaDto> listar(@RequestParam(required = false) String nome) {
		return empresaService.listar(nome);
	}

	@GetMapping("/{id}")
	public EmpresaDto buscar(@PathVariable Integer id) {
		return empresaService.buscarPorId(id);
	}

	@PostMapping
	public ResponseEntity<EmpresaDto> criar(@Valid @RequestBody EmpresaCreateRequest body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(empresaService.criar(body));
	}

	@PutMapping("/{id}")
	public EmpresaDto atualizar(@PathVariable Integer id, @Valid @RequestBody EmpresaUpdateRequest body) {
		return empresaService.atualizar(id, body);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> excluir(@PathVariable Integer id) {
		empresaService.excluir(id);
		return ResponseEntity.noContent().build();
	}
}
