package com.translog.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TranslogBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TranslogBackendApplication.class, args);
	}
}
