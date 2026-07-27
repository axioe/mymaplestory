package com.mymaplestory.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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
                // 세션 기반 로그인을 전혀 안 쓰는 순수 REST API인데, 세션 정책을 명시 안 해두면
                // Spring Security가 기본값(IF_REQUIRED)으로 필요할 때마다 세션을 만들면서
                // JSESSIONID 쿠키가 계속 쌓일 수 있다. 이게 "Request header is too large"
                // (Tomcat이 요청 자체를 거부)의 원인이었을 가능성이 높아서, 아예 세션을
                // 만들지 않도록 STATELESS로 고정한다.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/characters/**", "/api/notices/**",
                                "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();
    }
}
