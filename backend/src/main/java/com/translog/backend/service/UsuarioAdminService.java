package com.translog.backend.service;

import com.translog.backend.dto.UsuarioCreateRequest;
import com.translog.backend.dto.UsuarioDto;
import com.translog.backend.dto.UsuarioUpdateRequest;
import com.translog.backend.entity.Usuario;
import com.translog.backend.repository.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UsuarioAdminService {

	private static final String PERFIL_PADRAO = "USUARIO";
	private static final String ATIVO_PADRAO = "S";
	private static final Set<String> PERFIS_VALIDOS =
			Set.of("ADMIN", "OPERADOR", "MOTORISTA", "CLIENTE", "USUARIO");

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;

	@Transactional(readOnly = true)
	public List<UsuarioDto> listar(String nome) {
		String filtro = nome != null ? nome.trim() : "";
		return usuarioRepository.listarPorNome(filtro).stream().map(UsuarioAdminService::toDto).toList();
	}

	@Transactional(readOnly = true)
	public UsuarioDto buscarPorId(Integer id) {
		Usuario usuario =
				usuarioRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
		return toDto(usuario);
	}

	@Transactional
	public UsuarioDto criar(UsuarioCreateRequest body) {
		validarUnicidadeLoginEmail(body.getLogin(), body.getEmail(), null);

		Usuario usuario = new Usuario();
		usuario.setNome(body.getNome().trim());
		usuario.setLogin(body.getLogin().trim());
		usuario.setEmail(body.getEmail().trim());
		usuario.setSenhaHash(passwordEncoder.encode(body.getSenha().trim()));
		usuario.setTelefone(trimOrNull(body.getTelefone()));
		usuario.setPerfil(normalizarPerfil(body.getPerfil()));
		usuario.setAtivo(normalizarAtivo(body.getAtivo()));
		usuario.setDataCadastro(LocalDateTime.now());
		usuario.setToken(null);

		return toDto(usuarioRepository.save(usuario));
	}

	@Transactional
	public UsuarioDto atualizar(Integer id, UsuarioUpdateRequest body) {
		Usuario usuario =
				usuarioRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

		validarUnicidadeLoginEmail(body.getLogin(), body.getEmail(), id);

		usuario.setNome(body.getNome().trim());
		usuario.setLogin(body.getLogin().trim());
		usuario.setEmail(body.getEmail().trim());
		if (StringUtils.hasText(body.getSenha())) {
			String senha = body.getSenha().trim();
			if (senha.length() < 6) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve ter no mínimo 6 caracteres");
			}
			usuario.setSenhaHash(passwordEncoder.encode(senha));
			usuario.setToken(null);
		}
		usuario.setTelefone(trimOrNull(body.getTelefone()));
		usuario.setPerfil(normalizarPerfil(body.getPerfil()));
		usuario.setAtivo(normalizarAtivo(body.getAtivo()));

		return toDto(usuarioRepository.save(usuario));
	}

	@Transactional
	public void excluir(Integer id) {
		if (!usuarioRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
		}
		usuarioRepository.deleteById(id);
	}

	private void validarUnicidadeLoginEmail(String login, String email, Integer idExcluir) {
		String loginNorm = login != null ? login.trim() : "";
		String emailNorm = email != null ? email.trim() : "";
		if (idExcluir == null) {
			if (usuarioRepository.existsByLoginNormalized(loginNorm)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Login já cadastrado");
			}
			if (usuarioRepository.existsByEmailNormalized(emailNorm)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
			}
		} else {
			if (usuarioRepository.existsLoginForOther(loginNorm, idExcluir)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Login já cadastrado");
			}
			if (usuarioRepository.existsEmailForOther(emailNorm, idExcluir)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
			}
		}
	}

	private static String normalizarPerfil(String perfil) {
		if (!StringUtils.hasText(perfil)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o perfil");
		}
		String codigo = perfil.trim().toUpperCase(Locale.ROOT);
		if (!PERFIS_VALIDOS.contains(codigo)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Perfil inválido");
		}
		return codigo;
	}

	private static String normalizarAtivo(String ativo) {
		if (!StringUtils.hasText(ativo)) {
			return ATIVO_PADRAO;
		}
		String flag = ativo.trim().toUpperCase(Locale.ROOT);
		if (!flag.equals("S") && !flag.equals("N")) {
			return ATIVO_PADRAO;
		}
		return flag;
	}

	private static String trimOrNull(String value) {
		if (value == null) {
			return null;
		}
		String t = value.trim();
		return t.isEmpty() ? null : t;
	}

	private static UsuarioDto toDto(Usuario u) {
		return UsuarioDto.builder()
				.idUsuario(u.getIdUsuario())
				.nome(u.getNome())
				.login(u.getLogin())
				.email(u.getEmail())
				.telefone(u.getTelefone())
				.perfil(u.getPerfil())
				.ativo(u.getAtivo())
				.endereco(u.getEndereco())
				.cidade(u.getCidade())
				.estado(u.getEstado())
				.dataCadastro(u.getDataCadastro())
				.build();
	}
}
