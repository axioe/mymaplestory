package com.mymaplestory.api.dto;

import java.util.List;

/**
 * 프론트엔드로 내려가는 스케줄러 응답. @JsonProperty를 안 붙인 순수 camelCase라서
 * Jackson이 필드명 그대로("characterName", "dailyContents" 등) 직렬화한다.
 * (넥슨 원본 파싱은 NexonSchedulerResponse가 따로 담당 - NexonApiService에서 변환)
 */
public record SchedulerResponse(
        String date,
        String characterName,
        String worldName,
        Integer characterLevel,
        String characterClass,
        List<ContentItem> dailyContents,
        List<ContentItem> weeklyContents,
        List<BossContentItem> bossContents,
        Long weeklyBossClearCount,
        Long weeklyBossClearLimitCount
) {
}
