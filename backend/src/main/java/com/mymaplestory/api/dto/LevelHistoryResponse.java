package com.mymaplestory.api.dto;

/**
 * GET /api/characters/{name}/level-history 응답.
 * "가장 최근 레벨업이 언제였는지"만 알려준다.
 *
 * levelUpDate: 레벨업한 날짜 (조회 범위 lookbackDays 안에서 못 찾았으면 null)
 * daysSinceLevelUp: 그 날짜로부터 오늘까지 며칠 지났는지 (levelUpDate가 null이면 null)
 */
public record LevelHistoryResponse(
        String characterName,
        Integer currentLevel,
        String levelUpDate,
        Long daysSinceLevelUp,
        int lookbackDays
) {
}
