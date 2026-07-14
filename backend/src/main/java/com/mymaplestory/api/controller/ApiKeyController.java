package com.mymaplestory.api.controller;

import com.mymaplestory.api.service.NexonApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 로그인/회원가입이 없는 대신, 사용자가 입력한 넥슨 API 키가 실제로 유효한지
 * 프론트엔드에서 즉시 확인할 수 있는 엔드포인트.
 */
@RestController
@RequestMapping("/api/auth")
public class ApiKeyController {

    private final NexonApiService nexonApiService;

    public ApiKeyController(NexonApiService nexonApiService) {
        this.nexonApiService = nexonApiService;
    }

    /**
     * POST /api/auth/validate-key
     * 헤더: X-Nexon-Api-Key (필수)
     * 성공: 200 { "valid": true }
     * 키가 잘못된 경우: 401 (GlobalExceptionHandler가 처리)
     * 헤더 자체가 없는 경우: 400 (GlobalExceptionHandler가 처리)
     */
    @PostMapping("/validate-key")
    public ResponseEntity<Map<String, Object>> validateKey(
            @RequestHeader("X-Nexon-Api-Key") String apiKey
    ) {
        nexonApiService.validateApiKey(apiKey);
        return ResponseEntity.ok(Map.of("valid", true));
    }
}
