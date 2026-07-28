package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 넥슨 원본 공지/이벤트 항목 파싱 전용. 프론트로 그대로 내려주면 notice_id가
 * snake_case로 나가서 프론트가 기대하는 camelCase(noticeId)와 안 맞는 문제가
 * 있었다 (스케줄러와 같은 종류의 버그). 실제로 컨트롤러가 반환하는 타입은
 * NoticeItem(camelCase, 이 파일이 아님)이다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonNoticeItem(
        @JsonProperty("notice_id") Long noticeId,
        String title,
        String date,
        String url
) {
}
