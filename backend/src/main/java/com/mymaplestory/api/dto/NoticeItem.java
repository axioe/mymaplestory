package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 공지/이벤트 공통 항목.
 * 주의: url 필드는 넥슨 응답에 실제로 포함되는지 오프라인 환경이라 확인하지 못했다.
 * 없을 경우 NexonApiService에서 메이플스토리 공식 공지 게시판 링크로 대체한다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NoticeItem(
        @JsonProperty("notice_id") Long noticeId,
        String title,
        String date,
        String url
) {
}
