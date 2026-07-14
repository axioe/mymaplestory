package com.mymaplestory.api.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(NexonApiProperties.class)
public class WebClientConfig {

    /**
     * 넥슨 오픈 API 전용 RestClient.
     * API 키는 더 이상 고정 기본 헤더로 붙이지 않는다 - 사용자가 프론트에서 보낸
     * 개인 키를 요청마다 개별적으로 실어 보낸다 (NexonApiService 참고).
     */
    @Bean
    public RestClient nexonRestClient(NexonApiProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("Accept", "application/json")
                .build();
    }
}
