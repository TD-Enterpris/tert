package com.ract;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@SpringBootApplication
@EnableRedisHttpSession // Enable Redis-backed HTTP session
public class RactJavaApplication {

	public static void main(String[] args) {
		SpringApplication.run(RactJavaApplication.class, args);
	}

}
