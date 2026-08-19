package com.mymaplestory.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 보스 선택 조회/등록 요청·응답에 공통으로 쓰는 DTO.
 * 등록(PUT /boss-selections) 요청은 URL 경로에 bossName이 없어서 body의
 * bossName을 그대로 쓴다(삭제 쪽 DELETE /boss-selections/{bossName}만 경로에 있음).
 *
 * 길이 제한은 entity.BossSelectionEntity의 컬럼 길이(character_name/boss_name 64,
 * cycle 16 등)와 맞춰뒀다 - 안 맞으면 @Valid 없이 그대로 저장하려다 DB 제약
 * 위반(DataIntegrityViolationException)으로 500이 났었다.
 */
public record BossSelectionDto(
        @NotBlank @Size(max = 64) String bossName,
        @NotBlank @Size(max = 32) String difficulty,
        @Min(1) @Max(6) Integer partySize,
        @NotBlank @Size(max = 16) String cycle
) {
}
