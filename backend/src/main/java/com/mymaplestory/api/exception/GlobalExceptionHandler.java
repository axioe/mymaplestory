package com.mymaplestory.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidApiKeyException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidApiKey(InvalidApiKeyException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "INVALID_API_KEY",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(org.springframework.web.bind.MissingRequestHeaderException.class)
    public ResponseEntity<Map<String, Object>> handleMissingHeader(org.springframework.web.bind.MissingRequestHeaderException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "API_KEY_REQUIRED",
                "message", "넥슨 API 키가 필요합니다. X-Nexon-Api-Key 헤더로 전달해주세요."
        ));
    }

    @ExceptionHandler(ApiKeyRequiredException.class)
    public ResponseEntity<Map<String, Object>> handleApiKeyRequired(ApiKeyRequiredException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "API_KEY_REQUIRED",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(NexonApiException.class)
    public ResponseEntity<Map<String, Object>> handleNexonApiException(NexonApiException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "NEXON_API_ERROR",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "NOT_FOUND",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        return ResponseEntity.internalServerError().body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "INTERNAL_ERROR",
                "message", "예상치 못한 오류가 발생했습니다."
        ));
    }
}
