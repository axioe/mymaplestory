package com.mymaplestory.api.dto;

/**
 * 프론트엔드로 내려가는 공지/이벤트 항목. @JsonProperty를 안 붙인 순수 camelCase라서
 * Jackson이 필드명 그대로("noticeId") 직렬화한다.
 * (넥슨 원본 파싱은 NexonNoticeItem이 따로 담당 - NexonApiService에서 변환)
 */
public record NoticeItem(
        Long noticeId,
        String title,
        String date,
        String url
) {
    public static NoticeItem from(NexonNoticeItem item, String fallbackUrl) {
        String url = item.url() != null && !item.url().isBlank() ? item.url() : fallbackUrl;
        return new NoticeItem(item.noticeId(), item.title(), item.date(), url);
    }
}
