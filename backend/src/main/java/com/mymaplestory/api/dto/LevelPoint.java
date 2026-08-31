package com.mymaplestory.api.dto;

/**
 * 레벨 진척도 차트 한 점 - 특정 날짜의 레벨/경험치 진행률.
 * NexonApiService.getLevelHistory()가 레벨업 날짜를 역추적하며 하루씩 조회한
 * 결과를 버리지 않고 그대로 담아, 프론트에서 차트로 그릴 수 있게 한다.
 */
public record LevelPoint(
        String date,
        Integer level,
        String expRate
) {
}
