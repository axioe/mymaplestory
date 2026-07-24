package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * GET /character/scheduler 응답 중 요청받은 4개 필드만 담는다.
 * 정확한 필드 스펙은 아래 확인됨 (스크린샷 기준):
 *  - daily_contents: content_name, type, registration_flag, now_count, max_count, quest_state
 *  - boss_contents: content_name, difficulty, cycle, list_order_no, registration_flag, complete_flag
 *
 * 주의: /character/scheduler 경로 자체는 다른 character/* 엔드포인트 명명 규칙을 따른
 * 추정이다. 실제 경로가 다르면 NexonApiService의 .path(...) 값만 고치면 된다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SchedulerResponse(
        @JsonProperty("daily_contents") List<DailyContentItem> dailyContents,
        @JsonProperty("boss_contents") List<BossContentItem> bossContents,
        @JsonProperty("weekly_boss_clear_count") Long weeklyBossClearCount,
        @JsonProperty("weekly_boss_clear_limit_count") Long weeklyBossClearLimitCount
) {
}
