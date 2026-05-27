package com.translog.backend.auditoria;

import com.translog.backend.repository.UsuarioRepository;
import com.translog.backend.service.LogAuditoriaService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Registra cada chamada à API após a resposta (mais confiável que HandlerInterceptor).
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
@RequiredArgsConstructor
public class AuditoriaFilter extends OncePerRequestFilter {

	private final LogAuditoriaService logAuditoriaService;
	private final UsuarioRepository usuarioRepository;

	@Value("${app.auditoria.habilitado:true}")
	private boolean habilitado;

	@Override
	protected void doFilterInternal(
			HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
			filterChain.doFilter(request, response);
		} finally {
			registrarSeAplicavel(request, response);
		}
	}

	private void registrarSeAplicavel(HttpServletRequest request, HttpServletResponse response) {
		if (!habilitado || !AuditoriaSuporte.deveRegistrar(request, response)) {
			return;
		}
		String metodo = request.getMethod();
		String rota = AuditoriaSuporte.caminhoApi(request);
		String acao = AuditoriaSuporte.descreverAcao(metodo, rota, response.getStatus());
		var usuario = AuditoriaSuporte.resolverUsuario(request, usuarioRepository);
		logAuditoriaService.registrar(usuario.orElse(null), metodo, rota, acao, AuditoriaSuporte.extrairIp(request));
	}
}
