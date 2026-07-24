package com.mymaplestory.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 초기 스캐폴딩 단계 설정.
 * TODO: 로그인 성공 시 JWT 발급 + SecurityContext 인증 필터 추가 (다음 단계에서 구현)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // REST API + 별도 프론트엔드이므로 비활성화
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/characters/**", "/api/notices/**",
                                "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();
    }
}
