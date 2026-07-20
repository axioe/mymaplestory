package com.mymaplestory.api.dto;

import java.util.List;

/**
 * GET /api/characters/{name}/level-history 응답.
 * levelUps: 조회 구간 안에서 레벨이 오른 날짜 + 변경된 레벨만 담는다.
 * (일자별 경험치 진행률 표는 더 이상 내려주지 않는다 - 화면에서 필요 없어짐)
 */
public record LevelHistoryResponse(
        String characterName,
        int days,
        List<LevelUpEvent> levelUps
) {
}
