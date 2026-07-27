package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * GET /scheduler/character-state 응답 전체 (경로/필드 전부 실제 호출로 확인됨).
 *  - daily_contents / weekly_contents: content_name, type, registration_flag, now_count, max_count, quest_state
 *  - boss_contents: content_name, difficulty, cycle, list_order_no, registration_flag, complete_flag
 *
 * 처음엔 daily_contents/boss_contents/주간 보스 처치 횟수만 썼는데, 실제 응답을 보니
 * weekly_contents(길드/유니온/에픽던전 등 주간 콘텐츠 - daily_contents와 같은 구조)와
 * 캐릭터 기본 정보(date, character_name 등)도 같이 내려와서 전부 추가해둔다.
 * 실행해보고 화면에서 필요 없는 항목은 그때 빼면 된다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SchedulerResponse(
        String date,
        @JsonProperty("character_name") String characterName,
        @JsonProperty("world_name") String worldName,
        @JsonProperty("character_level") Integer characterLevel,
        @JsonProperty("character_class") String characterClass,
        @JsonProperty("daily_contents") List<DailyContentItem> dailyContents,
        @JsonProperty("weekly_contents") List<DailyContentItem> weeklyContents,
        @JsonProperty("boss_contents") List<BossContentItem> bossContents,
        @JsonProperty("weekly_boss_clear_count") Long weeklyBossClearCount,
        @JsonProperty("weekly_boss_clear_limit_count") Long weeklyBossClearLimitCount
) {
}
