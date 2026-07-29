package com.mymaplestory.api.dto;

/**
 * 보스 선택 조회/등록 요청·응답에 공통으로 쓰는 DTO.
 * 등록(PUT) 요청 시에는 bossName이 URL 경로에 있어서 body엔 없어도 되지만,
 * 구조를 단순하게 유지하려고 항상 같은 모양을 쓴다(등록 요청 시 bossName은 무시됨).
 */
public record BossSelectionDto(
        String bossName,
        String difficulty,
        Integer partySize,
        String cycle
) {
}
