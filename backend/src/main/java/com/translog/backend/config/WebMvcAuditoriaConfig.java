package com.translog.backend.config;

import com.translog.backend.auditoria.AuditoriaInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcAuditoriaConfig implements WebMvcConfigurer {

	private final AuditoriaInterceptor auditoriaInterceptor;

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(auditoriaInterceptor).addPathPatterns("/api/**");
	}
}
