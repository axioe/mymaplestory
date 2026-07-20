package com.mymaplestory.api.dto;

/**
 * 특정 날짜의 레벨/경험치 스냅샷.
 * expRate는 "현재 레벨 내 경험치 진행률(%)" 문자열이다 (넥슨 API가 절대 경험치 수치를
 * 별도로 내려주지 않아서, 표에서는 이 값을 경험치 진척도로 사용한다).
 */
public record LevelHistoryEntry(
        String date,
        Integer level,
        String expRate
) {
}
