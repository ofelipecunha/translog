package com.translog.backend.service;

import com.translog.backend.dto.EmpresaCreateRequest;
import com.translog.backend.dto.EmpresaDto;
import com.translog.backend.dto.EmpresaUpdateRequest;
import com.translog.backend.entity.Empresa;
import com.translog.backend.repository.EmpresaRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EmpresaService {

	private static final String ATIVO_PADRAO = "S";

	private final EmpresaRepository empresaRepository;

	@Transactional(readOnly = true)
	public List<EmpresaDto> listar(String nome) {
		String filtro = nome != null ? nome.trim() : "";
		return empresaRepository.listarPorNome(filtro).stream().map(EmpresaService::toDto).toList();
	}

	@Transactional(readOnly = true)
	public EmpresaDto buscarPorId(Integer id) {
		Empresa empresa =
				empresaRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada"));
		return toDto(empresa);
	}

	@Transactional
	public EmpresaDto criar(EmpresaCreateRequest body) {
		String cnpjDigitos = extrairDigitosCnpj(body.getCnpj());
		validarCnpjUnico(cnpjDigitos, null);

		Empresa empresa = new Empresa();
		preencherCampos(empresa, body);
		empresa.setCnpj(formatarCnpj(cnpjDigitos));
		empresa.setDataCadastro(LocalDateTime.now());

		return toDto(empresaRepository.save(empresa));
	}

	@Transactional
	public EmpresaDto atualizar(Integer id, EmpresaUpdateRequest body) {
		Empresa empresa =
				empresaRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada"));

		String cnpjDigitos = extrairDigitosCnpj(body.getCnpj());
		validarCnpjUnico(cnpjDigitos, id);

		preencherCampos(empresa, body);
		empresa.setCnpj(formatarCnpj(cnpjDigitos));

		return toDto(empresaRepository.save(empresa));
	}

	@Transactional
	public void excluir(Integer id) {
		if (!empresaRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada");
		}
		empresaRepository.deleteById(id);
	}

	private void preencherCampos(Empresa empresa, EmpresaCreateRequest body) {
		empresa.setRazaoSocial(body.getRazaoSocial().trim());
		empresa.setNomeFantasia(body.getNomeFantasia().trim());
		empresa.setEmail(trimOrNull(body.getEmail()));
		empresa.setTelefone(trimOrNull(body.getTelefone()));
		empresa.setEndereco(trimOrNull(body.getEndereco()));
		empresa.setNumero(trimOrNull(body.getNumero()));
		empresa.setBairro(trimOrNull(body.getBairro()));
		empresa.setCidade(trimOrNull(body.getCidade()));
		empresa.setEstado(normalizarUf(body.getEstado()));
		empresa.setCep(trimOrNull(body.getCep()));
		empresa.setAtivo(normalizarAtivo(body.getAtivo()));
	}

	private void preencherCampos(Empresa empresa, EmpresaUpdateRequest body) {
		empresa.setRazaoSocial(body.getRazaoSocial().trim());
		empresa.setNomeFantasia(body.getNomeFantasia().trim());
		empresa.setEmail(trimOrNull(body.getEmail()));
		empresa.setTelefone(trimOrNull(body.getTelefone()));
		empresa.setEndereco(trimOrNull(body.getEndereco()));
		empresa.setNumero(trimOrNull(body.getNumero()));
		empresa.setBairro(trimOrNull(body.getBairro()));
		empresa.setCidade(trimOrNull(body.getCidade()));
		empresa.setEstado(normalizarUf(body.getEstado()));
		empresa.setCep(trimOrNull(body.getCep()));
		empresa.setAtivo(normalizarAtivo(body.getAtivo()));
	}

	private void validarCnpjUnico(String cnpjDigitos, Integer idExcluir) {
		boolean existe =
				idExcluir == null
						? empresaRepository.existsByCnpjDigitos(cnpjDigitos)
						: empresaRepository.existsByCnpjDigitosForOther(cnpjDigitos, idExcluir);
		if (existe) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "CNPJ já cadastrado");
		}
	}

	private static String extrairDigitosCnpj(String cnpj) {
		if (!StringUtils.hasText(cnpj)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ inválido");
		}
		String digits = cnpj.replaceAll("\\D", "");
		if (digits.length() != 14) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ deve conter 14 dígitos");
		}
		return digits;
	}

	private static String formatarCnpj(String digits) {
		return String.format(
				"%s.%s.%s/%s-%s",
				digits.substring(0, 2),
				digits.substring(2, 5),
				digits.substring(5, 8),
				digits.substring(8, 12),
				digits.substring(12, 14));
	}

	private static String normalizarUf(String estado) {
		if (!StringUtils.hasText(estado)) {
			return null;
		}
		return estado.trim().toUpperCase();
	}

	private static String normalizarAtivo(String ativo) {
		if (!StringUtils.hasText(ativo)) {
			return ATIVO_PADRAO;
		}
		String v = ativo.trim().toUpperCase();
		return "N".equals(v) ? "N" : "S";
	}

	private static String trimOrNull(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}

	private static EmpresaDto toDto(Empresa empresa) {
		return EmpresaDto.builder()
				.codEmpresa(empresa.getCodEmpresa())
				.razaoSocial(empresa.getRazaoSocial())
				.nomeFantasia(empresa.getNomeFantasia())
				.cnpj(empresa.getCnpj())
				.email(empresa.getEmail())
				.telefone(empresa.getTelefone())
				.endereco(empresa.getEndereco())
				.numero(empresa.getNumero())
				.bairro(empresa.getBairro())
				.cidade(empresa.getCidade())
				.estado(empresa.getEstado())
				.cep(empresa.getCep())
				.ativo(empresa.getAtivo())
				.dataCadastro(empresa.getDataCadastro())
				.build();
	}
}
