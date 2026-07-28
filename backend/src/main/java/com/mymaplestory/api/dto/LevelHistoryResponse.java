package com.mymaplestory.api.dto;

/**
 * GET /api/characters/{name}/level-history 응답.
 *
 * expRate: 현재 레벨에서의 경험치 진행률(%) - 넥슨이 오늘 시점 정보는 항상 정확히
 * 내려주므로 이게 가장 신뢰할 수 있는 "진척도" 지표다. 화면에서 이걸 기본으로 보여준다.
 *
 * levelUpDate/daysSinceLevelUp: "가장 최근 레벨업 날짜"를 과거 날짜 조회로 역추적한
 * 결과다. 참고: 넥슨 API가 character/basic의 date 파라미터로 조회 가능한 과거
 * 기간이 lookbackDays(예: 30일)보다 훨씬 짧아서(며칠 정도로 추정), 그보다 오래
 * 전에 레벨업했다면 이 값은 못 찾고 null로 내려간다 - 그래서 참고용 보조 정보로만
 * 쓰고, expRate를 주 정보로 삼는다.
 */
public record LevelHistoryResponse(
        String characterName,
        Integer currentLevel,
        String expRate,
        String levelUpDate,
        Long daysSinceLevelUp,
        int lookbackDays
) {
}
