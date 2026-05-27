package com.translog.backend.auditoria;

import com.translog.backend.entity.Usuario;
import com.translog.backend.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;
import lombok.experimental.UtilityClass;
import org.springframework.util.StringUtils;

@UtilityClass
public class AuditoriaSuporte {

	public boolean deveRegistrar(HttpServletRequest request, HttpServletResponse response) {
		if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
			return false;
		}
		String path = caminhoApi(request);
		if (!path.startsWith("/api/")) {
			return false;
		}
		if (path.startsWith("/api/files/")) {
			return false;
		}
		if ("POST".equalsIgnoreCase(request.getMethod()) && "/api/auth/login".equals(path)) {
			return false;
		}
		return response.getStatus() < 500;
	}

	public String caminhoApi(HttpServletRequest request) {
		String path = request.getRequestURI();
		if (!StringUtils.hasText(path)) {
			path = "";
		}
		String context = request.getContextPath();
		if (StringUtils.hasText(context) && path.startsWith(context)) {
			path = path.substring(context.length());
		}
		if (!path.startsWith("/") && StringUtils.hasText(path)) {
			path = "/" + path;
		}
		String query = request.getQueryString();
		if (StringUtils.hasText(query)) {
			path = path + "?" + query;
		}
		return path;
	}

	public Optional<Usuario> resolverUsuario(HttpServletRequest request, UsuarioRepository usuarioRepository) {
		String auth = request.getHeader("Authorization");
		if (!StringUtils.hasText(auth) || !auth.startsWith("Bearer ")) {
			return Optional.empty();
		}
		String token = auth.substring(7).trim();
		if (!StringUtils.hasText(token)) {
			return Optional.empty();
		}
		return usuarioRepository.findByToken(token);
	}

	public String descreverAcao(String metodo, String rota, int status) {
		return metodo + " " + rota + " → HTTP " + status;
	}

	public String extrairIp(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (StringUtils.hasText(forwarded)) {
			return forwarded.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}
}
