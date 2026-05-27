package com.translog.backend.bootstrap;

import com.translog.backend.entity.Usuario;
import com.translog.backend.repository.UsuarioRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UsuarioDataSeeder implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(UsuarioDataSeeder.class);

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${app.seed.enabled:true}")
	private boolean seedEnabled;

	@Value("${app.seed.email:admin@translog.com.br}")
	private String seedEmail;

	@Value("${app.seed.login:admin}")
	private String seedLogin;

	@Value("${app.seed.nome:Administrador}")
	private String seedNome;

	@Value("${app.seed.senha:123456}")
	private String seedSenha;

	@Override
	public void run(ApplicationArguments args) {
		if (!seedEnabled || usuarioRepository.count() > 0) {
			return;
		}

		Usuario admin = new Usuario();
		admin.setNome(seedNome);
		admin.setLogin(seedLogin);
		admin.setEmail(seedEmail);
		admin.setSenhaHash(passwordEncoder.encode(seedSenha));
		admin.setPerfil("ADMIN");
		admin.setAtivo("S");
		admin.setDataCadastro(LocalDateTime.now());
		usuarioRepository.save(admin);

		log.info("Usuário inicial criado: e-mail={}, login={}", seedEmail, seedLogin);
	}
}
