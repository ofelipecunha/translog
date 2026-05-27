package com.translog.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Execute como aplicação Java para gerar um hash BCrypt para inserção manual no banco.
 * Argumento opcional: senha em texto (padrão {@code 123456}).
 */
public final class BcryptSenhaUtil {

	private BcryptSenhaUtil() {}

	public static void main(String[] args) {
		String plain = args.length > 0 ? args[0] : "123456";
		System.out.println(new BCryptPasswordEncoder().encode(plain));
	}
}
