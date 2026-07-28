package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * GET /scheduler/character-state 원본 응답 파싱 전용 (경로/필드 실제 호출로 확인됨).
 * 이건 넥슨 쪽 snake_case 응답을 읽어들이기 위한 내부용 DTO라서, 프론트엔드로
 * 그대로 내려주면 안 된다 (내려주면 프론트가 기대하는 camelCase와 안 맞아서
 * 전부 undefined가 되는 버그가 있었음 - 카드 API처럼 출력용 DTO를 따로 둬야 한다).
 * 실제로 컨트롤러가 반환하는 타입은 SchedulerResponse(camelCase, 이 파일이 아님)이다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonSchedulerResponse(
        String date,
        @JsonProperty("character_name") String characterName,
        @JsonProperty("world_name") String worldName,
        @JsonProperty("character_level") Integer characterLevel,
        @JsonProperty("character_class") String characterClass,
        @JsonProperty("daily_contents") List<NexonContentItem> dailyContents,
        @JsonProperty("weekly_contents") List<NexonContentItem> weeklyContents,
        @JsonProperty("boss_contents") List<NexonBossContentItem> bossContents,
        @JsonProperty("weekly_boss_clear_count") Long weeklyBossClearCount,
        @JsonProperty("weekly_boss_clear_limit_count") Long weeklyBossClearLimitCount
) {
}
