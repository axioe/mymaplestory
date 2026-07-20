package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * 넥슨 오픈 API 에러 응답 형식.
 * 문서상 "JSON-API 형식"으로 명시되어 있으며, 실패 시 아래와 같은 형태로 내려온다:
 * { "error": { "name": "OPENAPI00005", "message": "유효하지 않은 API KEY 입니다." } }
 *
 * 에러 코드 표 (openapi.nexon.com 가이드 기준):
 *  OPENAPI00001 서버 내부 오류        OPENAPI00002 권한이 없는 경우
 *  OPENAPI00003 유효하지 않은 식별자   OPENAPI00004 파라미터 누락/유효하지 않음
 *  OPENAPI00005 유효하지 않은 API KEY OPENAPI00006 유효하지 않은 API PATH
 *  OPENAPI00007 API 호출량 초과       OPENAPI00009 데이터 준비 중
 *  OPENAPI00010 게임 점검 중          OPENAPI00011 API 점검 중
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonErrorResponse(NexonError error) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record NexonError(String name, String message) {
    }
}
