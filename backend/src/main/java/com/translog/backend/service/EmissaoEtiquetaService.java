package com.translog.backend.service;

import com.translog.backend.dto.EmissaoEtiquetaCreateRequest;
import com.translog.backend.dto.EmissaoEtiquetaDto;
import com.translog.backend.dto.EmissaoEtiquetaVolumeDto;
import com.translog.backend.entity.EmissaoEtiqueta;
import com.translog.backend.entity.EmissaoEtiquetaVolume;
import com.translog.backend.repository.EmissaoEtiquetaRepository;
import com.translog.backend.repository.EmissaoEtiquetaVolumeRepository;
import com.translog.backend.repository.EmpresaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EmissaoEtiquetaService {

	private static final String STATUS_EMITIDA = "EMITIDA";
	private static final DateTimeFormatter DATA_ETIQUETA = DateTimeFormatter.BASIC_ISO_DATE;

	private final EmissaoEtiquetaRepository emissaoEtiquetaRepository;
	private final EmissaoEtiquetaVolumeRepository emissaoEtiquetaVolumeRepository;
	private final EmpresaRepository empresaRepository;

	@Transactional(readOnly = true)
	public List<EmissaoEtiquetaDto> listarPorNumeroPedido(String numeroPedido) {
		if (!StringUtils.hasText(numeroPedido)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o número do pedido");
		}
		return emissaoEtiquetaRepository
				.findByNumeroPedidoIgnoreCaseOrderByDataEmissaoDesc(numeroPedido.trim())
				.stream()
				.map(this::toDtoComVolumes)
				.toList();
	}

	@Transactional
	public EmissaoEtiquetaDto criar(EmissaoEtiquetaCreateRequest body) {
		validarEmpresas(body.getCodEmpresaOrigem(), body.getCodEmpresaDestino());

		EmissaoEtiqueta emissao = new EmissaoEtiqueta();
		emissao.setCodEmpresaOrigem(body.getCodEmpresaOrigem());
		emissao.setCodEmpresaDestino(body.getCodEmpresaDestino());
		emissao.setNumeroPedido(body.getNumeroPedido().trim());
		emissao.setDataPedido(body.getDataPedido());
		emissao.setQuantidadeVolumes(body.getQuantidadeVolumes());
		emissao.setStatus(STATUS_EMITIDA);
		emissao.setDataEmissao(LocalDateTime.now());

		EmissaoEtiqueta salva = emissaoEtiquetaRepository.save(emissao);
		List<EmissaoEtiquetaVolume> volumes = gerarESalvarVolumes(salva);
		return toDto(salva, volumes);
	}

	private List<EmissaoEtiquetaVolume> gerarESalvarVolumes(EmissaoEtiqueta emissao) {
		List<EmissaoEtiquetaVolume> volumes = new ArrayList<>();
		for (int i = 1; i <= emissao.getQuantidadeVolumes(); i++) {
			EmissaoEtiquetaVolume volume = new EmissaoEtiquetaVolume();
			volume.setEmissao(emissao);
			volume.setNumeroVolume(i);
			volume.setCodigoEtiqueta(gerarCodigoEtiqueta(emissao.getDataPedido(), emissao.getNumeroPedido(), i));
			volumes.add(emissaoEtiquetaVolumeRepository.save(volume));
		}
		return volumes;
	}

	static String gerarCodigoEtiqueta(LocalDate dataPedido, String numeroPedido, int numeroVolume) {
		String data = dataPedido.format(DATA_ETIQUETA);
		String seq = String.format("%02d", numeroVolume);
		return data + "-" + numeroPedido.trim() + "-" + seq;
	}

	private EmissaoEtiquetaDto toDtoComVolumes(EmissaoEtiqueta emissao) {
		List<EmissaoEtiquetaVolume> volumes =
				emissaoEtiquetaVolumeRepository.findByEmissaoIdEmissaoOrderByNumeroVolumeAsc(emissao.getIdEmissao());
		return toDto(emissao, volumes);
	}

	private static EmissaoEtiquetaDto toDto(EmissaoEtiqueta emissao, List<EmissaoEtiquetaVolume> volumes) {
		return EmissaoEtiquetaDto.builder()
				.idEmissao(emissao.getIdEmissao())
				.codEmpresaOrigem(emissao.getCodEmpresaOrigem())
				.codEmpresaDestino(emissao.getCodEmpresaDestino())
				.numeroPedido(emissao.getNumeroPedido())
				.dataPedido(emissao.getDataPedido())
				.quantidadeVolumes(emissao.getQuantidadeVolumes())
				.status(emissao.getStatus())
				.dataEmissao(emissao.getDataEmissao())
				.volumes(volumes.stream().map(EmissaoEtiquetaService::toVolumeDto).toList())
				.build();
	}

	private static EmissaoEtiquetaVolumeDto toVolumeDto(EmissaoEtiquetaVolume volume) {
		return EmissaoEtiquetaVolumeDto.builder()
				.numeroVolume(volume.getNumeroVolume())
				.codigoEtiqueta(volume.getCodigoEtiqueta())
				.build();
	}

	private void validarEmpresas(Integer codOrigem, Integer codDestino) {
		if (codOrigem.equals(codDestino)) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST, "A empresa de origem deve ser diferente da empresa de destino");
		}
		if (!empresaRepository.existsById(codOrigem)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empresa de origem não encontrada");
		}
		if (!empresaRepository.existsById(codDestino)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empresa de destino não encontrada");
		}
	}
}
