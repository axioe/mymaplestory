package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * daily_contents 배열의 항목 하나.
 * registration_flag/quest_state 등은 문서상 boolean이 아니라 string으로 내려온다
 * ("true"/"false", "0"/"1"/"2").
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record DailyContentItem(
        @JsonProperty("content_name") String contentName,
        String type, // 'contents' | 'quest'
        @JsonProperty("registration_flag") String registrationFlag, // "true" | "false"
        @JsonProperty("now_count") Long nowCount,
        @JsonProperty("max_count") Long maxCount,
        @JsonProperty("quest_state") String questState // "0":기타, "1":진행 중, "2":완료
) {
}
