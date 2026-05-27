package com.translog.backend.auditoria;

import jakarta.servlet.http.HttpServletRequest;

/**
 * @deprecated Use {@link AuditoriaSuporte}. Mantido para compatibilidade com referências antigas.
 */
@Deprecated
public final class AuditoriaInterceptor {

	private AuditoriaInterceptor() {}

	public static String extrairIp(HttpServletRequest request) {
		return AuditoriaSuporte.extrairIp(request);
	}
}
