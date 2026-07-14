package com.mymaplestory.api.dto;

/**
 * GET /id 응답 - 캐릭터명으로 ocid(캐릭터 식별자)를 조회한 결과.
 * 이후 모든 캐릭터 관련 조회는 이 ocid를 사용한다.
 */
public record OcidResponse(String ocid) {
}
