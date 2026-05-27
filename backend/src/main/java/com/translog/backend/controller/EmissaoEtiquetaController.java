package com.translog.backend.controller;

import com.translog.backend.dto.EmissaoEtiquetaCreateRequest;
import com.translog.backend.dto.EmissaoEtiquetaDto;
import com.translog.backend.service.EmissaoEtiquetaService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emissao-etiquetas")
@RequiredArgsConstructor
public class EmissaoEtiquetaController {

	private final EmissaoEtiquetaService emissaoEtiquetaService;

	@GetMapping
	public List<EmissaoEtiquetaDto> listar(@RequestParam(required = false) String numeroPedido) {
		return emissaoEtiquetaService.listarPorNumeroPedido(numeroPedido);
	}

	@PostMapping
	public ResponseEntity<EmissaoEtiquetaDto> criar(@Valid @RequestBody EmissaoEtiquetaCreateRequest body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(emissaoEtiquetaService.criar(body));
	}
}
