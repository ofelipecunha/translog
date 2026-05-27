package com.translog.backend.bootstrap;

import com.translog.backend.entity.Usuario;
import com.translog.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Opcional: se o hash no banco não bater com a senha em texto configurada, grava um novo BCrypt na
 * subida do servidor (útil quando o INSERT manual usou hash de exemplo).
 */
@Component
@RequiredArgsConstructor
public class UsuarioSenhaSyncRunner implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(UsuarioSenhaSyncRunner.class);

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.auth.sync-password-on-startup:false}")
	private boolean syncOnStartup;

	@Value("${app.auth.sync-password.email:}")
	private String syncEmail;

	@Value("${app.auth.sync-password.plain:}")
	private String syncPlain;

	@Override
	public void run(ApplicationArguments args) {
		if (!syncOnStartup || !StringUtils.hasText(syncEmail) || !StringUtils.hasText(syncPlain)) {
			return;
		}

		String email = syncEmail.trim();
		String plain = syncPlain.trim();

		usuarioRepository.findByEmailNormalized(email).ifPresentOrElse(
				usuario -> sincronizarSeNecessario(usuario, plain, email),
				() -> log.warn("sync-password: usuário não encontrado [{}]", email));
	}

	private void sincronizarSeNecessario(Usuario usuario, String plain, String email) {
		String hash = usuario.getSenhaHash();
		if (hash != null && passwordEncoder.matches(plain, hash.trim())) {
			return;
		}
		usuario.setSenhaHash(passwordEncoder.encode(plain));
		usuarioRepository.save(usuario);
		log.warn(
				"Senha BCrypt atualizada para [{}] (hash anterior não correspondia a app.auth.sync-password.plain)",
				email);
	}
}
