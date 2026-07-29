package com.mymaplestory.api.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
@EnableConfigurationProperties(NexonApiProperties.class)
public class WebClientConfig {

    /**
     * 넥슨 오픈 API 전용 RestClient.
     * API 키는 더 이상 고정 기본 헤더로 붙이지 않는다 - 사용자가 프론트에서 보낸
     * 개인 키를 요청마다 개별적으로 실어 보낸다 (NexonApiService 참고).
     *
     * 타임아웃을 명시적으로 넉넉하게 잡아둔다 (스케줄러처럼 응답이 큰 엔드포인트도
     * 안전하게 받을 수 있도록 - 연결 5초, 응답 읽기 30초).
     */
    @Bean
    public RestClient nexonRestClient(NexonApiProperties properties) {
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.DEFAULTS
                .withConnectTimeout(Duration.ofSeconds(5))
                .withReadTimeout(Duration.ofSeconds(30));

        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("Accept", "application/json")
                .requestFactory(ClientHttpRequestFactories.get(settings))
                .build();
    }
}
