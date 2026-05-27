package com.translog.backend.config;

import java.io.File;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcStaticConfig implements WebMvcConfigurer {

	@Value("${app.upload.avatars-dir:data/avatars}")
	private String avatarsDir;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String abs = new File(avatarsDir).getAbsoluteFile().toURI().toString();
		if (!abs.endsWith("/")) {
			abs = abs + "/";
		}
		registry.addResourceHandler("/api/files/avatars/**").addResourceLocations(abs);
	}
}
