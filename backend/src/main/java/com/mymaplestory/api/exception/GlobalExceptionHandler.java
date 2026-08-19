package com.mymaplestory.api.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidApiKeyException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidApiKey(InvalidApiKeyException ex) {
        // API 키 값 자체는 메시지에 포함되지 않으니 그대로 찍어도 안전함 - "유효하지 않은 키였다"는
        // 사실만 남는다. 사용자가 잘못 입력한 흔한 케이스라 warn이 아니라 debug로 낮춰서 로그가
        // 이걸로 도배되지 않게 한다.
        log.debug("Invalid Nexon API key: {}", ex.getMessage());
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
                "message", "넥슨 API 키가 필요합니다. x-nxopen-api-key 헤더로 전달해주세요."
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
        // 넥슨 쪽 장애/레이트리밋/응답 형식 이상 등 우리 쪽 버그가 아닐 수도 있는 원인이 섞여
        // 있어서 warn - 반복적으로 찍히면 넥슨 API 자체 이슈를 의심할 신호가 된다.
        log.warn("Nexon API call failed: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "NEXON_API_ERROR",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.debug("Bad request: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "NOT_FOUND",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        Map<String, Object> fieldErrors = new LinkedHashMap<>();
        for (var fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        log.debug("Request validation failed: {}", fieldErrors);
        return ResponseEntity.badRequest().body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "VALIDATION_FAILED",
                "message", "요청 값이 올바르지 않습니다.",
                "fields", fieldErrors
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        // 이게 없으면(예전 상태) 배포 후 500이 나도 서버 콘솔에 아무 흔적이 안 남아서
        // 원인 추적이 사실상 불가능했다 - 반드시 스택트레이스까지 남긴다.
        log.error("Unexpected error", ex);
        return ResponseEntity.internalServerError().body(Map.of(
                "timestamp", Instant.now().toString(),
                "error", "INTERNAL_ERROR",
                "message", "예상치 못한 오류가 발생했습니다."
        ));
    }
}
