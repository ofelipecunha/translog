package com.translog.backend.service;

import com.translog.backend.dto.LoginRequest;
import com.translog.backend.dto.LoginResponse;
import com.translog.backend.dto.PerfilUsuarioResponse;
import com.translog.backend.dto.PerfilUsuarioUpdateRequest;
import com.translog.backend.entity.Usuario;
import com.translog.backend.repository.UsuarioRepository;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

	private static final Logger log = LoggerFactory.getLogger(AuthService.class);
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();
	private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
			MediaType.IMAGE_JPEG_VALUE,
			MediaType.IMAGE_PNG_VALUE,
			MediaType.IMAGE_GIF_VALUE,
			"image/webp");

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.upload.avatars-dir:data/avatars}")
	private String avatarsUploadDir;

	@Value("${app.upload.max-avatar-mb:25}")
	private int maxAvatarMb;

	@Transactional
	public LoginResponse login(LoginRequest request) {
		String emailNorm = request.getEmail() != null ? request.getEmail().trim() : "";
		String senhaDigitada = request.getSenha() != null ? request.getSenha() : "";

		Usuario usuario = usuarioRepository
				.findByEmailNormalized(emailNorm)
				.orElseGet(() -> usuarioRepository
						.findByLoginNormalized(emailNorm)
						.orElseThrow(() -> {
							log.warn("Login falhou: e-mail/login não encontrado [{}]", emailNorm);
							return new ResponseStatusException(
									HttpStatus.UNAUTHORIZED, "E-mail ou login não encontrado.");
						}));

		if (!isUsuarioAtivo(usuario)) {
			log.warn("Login falhou: usuário inativo [{}]", emailNorm);
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário inativo");
		}

		if (!senhaConfereComArmazenado(senhaDigitada, usuario.getSenhaHash())) {
			log.warn("Login falhou: senha incorreta para e-mail [{}]", emailNorm);
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Senha incorreta.");
		}

		if (!isBcryptHash(usuario.getSenhaHash())) {
			usuario.setSenhaHash(passwordEncoder.encode(senhaDigitada.trim()));
		}

		String novoToken = gerarTokenSeguro();
		usuario.setToken(novoToken);
		usuarioRepository.save(usuario);

		return LoginResponse.builder()
				.idLogin(usuario.getIdUsuario())
				.nome(usuario.getNome())
				.email(usuario.getEmail())
				.token(novoToken)
				.imagem(usuario.getImagemUrl())
				.build();
	}

	@Transactional(readOnly = true)
	public PerfilUsuarioResponse perfilDoToken(String authorizationHeader) {
		Usuario usuario = requireUsuarioPorBearer(authorizationHeader);
		return toPerfil(usuario);
	}

	@Transactional
	public PerfilUsuarioResponse atualizarPerfil(String authorizationHeader, PerfilUsuarioUpdateRequest body) {
		Usuario usuario = requireUsuarioPorBearer(authorizationHeader);
		if (body == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição em falta");
		}
		if (StringUtils.hasText(body.getNome())) {
			usuario.setNome(body.getNome().trim());
		}
		if (body.getTelefone() != null) {
			usuario.setTelefone(body.getTelefone().isBlank() ? null : body.getTelefone().trim());
		}
		if (body.getEndereco() != null) {
			usuario.setEndereco(body.getEndereco().isBlank() ? null : body.getEndereco().trim());
		}
		if (body.getCidade() != null) {
			usuario.setCidade(body.getCidade().isBlank() ? null : body.getCidade().trim());
		}
		if (body.getEstado() != null) {
			String uf = body.getEstado().trim().toUpperCase(Locale.ROOT);
			usuario.setEstado(uf.isBlank() ? null : uf);
		}
		usuarioRepository.save(usuario);
		return toPerfil(usuario);
	}

	@Transactional
	public PerfilUsuarioResponse atualizarImagemPerfil(String authorizationHeader, MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ficheiro em falta");
		}
		if (file.getSize() > maxAvatarBytes()) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST, "Imagem demasiado grande (máx. " + maxAvatarMb + " MB)");
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST, "Tipo de ficheiro não suportado (use JPEG, PNG, GIF ou WebP)");
		}

		Usuario usuario = requireUsuarioPorBearer(authorizationHeader);
		deleteManagedAvatarFile(usuario.getImagemUrl());

		Path dir = Paths.get(avatarsUploadDir).toAbsolutePath().normalize();
		try {
			Files.createDirectories(dir);
		} catch (IOException e) {
			log.error("Não foi possível criar pasta de avatares: {}", dir, e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao preparar armazenamento");
		}

		String ext = extensaoSegura(file, contentType);
		String filename = usuario.getIdUsuario() + "-" + UUID.randomUUID() + ext;
		Path target = dir.resolve(filename);

		try (InputStream in = file.getInputStream()) {
			Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException e) {
			log.error("Falha ao gravar avatar para {}", target, e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao gravar imagem");
		}

		String publicPath = "/api/files/avatars/" + filename;
		usuario.setImagemUrl(publicPath);
		usuarioRepository.save(usuario);
		return toPerfil(usuario);
	}

	@Transactional
	public Usuario requireUsuarioPorBearer(String authorizationHeader) {
		String token = extrairBearerToken(authorizationHeader);
		return usuarioRepository
				.findByToken(token)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida ou expirada"));
	}

	private long maxAvatarBytes() {
		return Math.max(1, maxAvatarMb) * 1024L * 1024L;
	}

	private void deleteManagedAvatarFile(String imagemUrl) {
		if (!StringUtils.hasText(imagemUrl) || !imagemUrl.contains("/api/files/avatars/")) {
			return;
		}
		int idx = imagemUrl.lastIndexOf("/api/files/avatars/");
		String name = imagemUrl.substring(idx + "/api/files/avatars/".length());
		if (name.isBlank() || name.contains("..") || name.contains("/") || name.contains("\\")) {
			return;
		}
		Path dir = Paths.get(avatarsUploadDir).toAbsolutePath().normalize();
		Path old = dir.resolve(name).normalize();
		if (!old.startsWith(dir)) {
			return;
		}
		try {
			Files.deleteIfExists(old);
		} catch (IOException e) {
			log.warn("Não foi possível apagar avatar antigo: {}", old, e);
		}
	}

	private static String extensaoSegura(MultipartFile file, String contentType) {
		String original = file.getOriginalFilename();
		String lower = original != null ? original.toLowerCase(Locale.ROOT) : "";
		if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
			return ".jpg";
		}
		if (lower.endsWith(".png")) {
			return ".png";
		}
		if (lower.endsWith(".gif")) {
			return ".gif";
		}
		if (lower.endsWith(".webp")) {
			return ".webp";
		}
		if (MediaType.IMAGE_JPEG_VALUE.equalsIgnoreCase(contentType)) {
			return ".jpg";
		}
		if (MediaType.IMAGE_PNG_VALUE.equalsIgnoreCase(contentType)) {
			return ".png";
		}
		if (MediaType.IMAGE_GIF_VALUE.equalsIgnoreCase(contentType)) {
			return ".gif";
		}
		return ".webp";
	}

	private static PerfilUsuarioResponse toPerfil(Usuario usuario) {
		return PerfilUsuarioResponse.builder()
				.idLogin(usuario.getIdUsuario())
				.nome(usuario.getNome())
				.login(usuario.getLogin())
				.email(usuario.getEmail())
				.endereco(usuario.getEndereco())
				.cidade(usuario.getCidade())
				.estado(usuario.getEstado())
				.telefone(usuario.getTelefone())
				.imagem(usuario.getImagemUrl())
				.perfil(usuario.getPerfil())
				.build();
	}

	private static String extrairBearerToken(String authorizationHeader) {
		if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token ausente");
		}
		String token = authorizationHeader.substring(7).trim();
		if (!StringUtils.hasText(token)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token ausente");
		}
		return token;
	}

	private static String gerarTokenSeguro() {
		byte[] bytes = new byte[48];
		SECURE_RANDOM.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private static boolean isBcryptHash(String armazenado) {
		if (armazenado == null || armazenado.length() < 60) {
			return false;
		}
		return armazenado.startsWith("$2a$")
				|| armazenado.startsWith("$2b$")
				|| armazenado.startsWith("$2y$");
	}

	private static boolean isUsuarioAtivo(Usuario usuario) {
		String ativo = usuario.getAtivo();
		if (ativo == null || ativo.isBlank()) {
			return true;
		}
		String flag = ativo.trim().toUpperCase();
		return flag.equals("S")
				|| flag.equals("SIM")
				|| flag.equals("Y")
				|| flag.equals("YES")
				|| flag.equals("T")
				|| flag.equals("TRUE")
				|| flag.equals("1");
	}

	private boolean senhaConfereComArmazenado(String senhaDigitada, String armazenado) {
		if (armazenado == null || senhaDigitada == null) {
			return false;
		}
		String digitada = senhaDigitada.trim();
		if (digitada.isEmpty()) {
			return false;
		}
		String hash = armazenado.trim();
		if (isBcryptHash(hash)) {
			return passwordEncoder.matches(digitada, hash);
		}
		return digitada.equals(hash);
	}
}
