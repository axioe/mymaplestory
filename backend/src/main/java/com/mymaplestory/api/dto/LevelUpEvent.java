package com.mymaplestory.api.dto;

/**
 * 레벨이 오른 날짜를 나타낸다. (조회 구간 내에서 fromLevel -> toLevel로 오른 첫 관측일)
 */
public record LevelUpEvent(
        String date,
        Integer fromLevel,
        Integer toLevel
) {
}
