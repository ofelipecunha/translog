package com.translog.backend.auditoria;

import com.translog.backend.entity.Usuario;
import com.translog.backend.repository.UsuarioRepository;
import com.translog.backend.service.LogAuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuditoriaInterceptor implements HandlerInterceptor {

	private final LogAuditoriaService logAuditoriaService;
	private final UsuarioRepository usuarioRepository;

	@Value("${app.auditoria.habilitado:true}")
	private boolean habilitado;

	@Override
	public void afterCompletion(
			HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
		if (!habilitado || !deveRegistrar(request, response)) {
			return;
		}
		String metodo = request.getMethod();
		String rota = request.getRequestURI();
		String query = request.getQueryString();
		if (StringUtils.hasText(query)) {
			rota = rota + "?" + query;
		}
		String acao = descreverAcao(metodo, rota, response.getStatus());
		Optional<Usuario> usuario = resolverUsuario(request);
		logAuditoriaService.registrar(usuario.orElse(null), metodo, rota, acao, extrairIp(request));
	}

	private boolean deveRegistrar(HttpServletRequest request, HttpServletResponse response) {
		if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
			return false;
		}
		String path = request.getRequestURI();
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

	private Optional<Usuario> resolverUsuario(HttpServletRequest request) {
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

	private static String descreverAcao(String metodo, String rota, int status) {
		return metodo + " " + rota + " → HTTP " + status;
	}

	static String extrairIp(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (StringUtils.hasText(forwarded)) {
			return forwarded.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}
}
