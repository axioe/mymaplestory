package com.mymaplestory.api.dto;

public record ContentItem(
        String contentName,
        String type,
        String registrationFlag,
        Long nowCount,
        Long maxCount,
        String questState
) {
    public static ContentItem from(NexonContentItem item) {
        return new ContentItem(
                item.contentName(),
                item.type(),
                item.registrationFlag(),
                item.nowCount(),
                item.maxCount(),
                item.questState()
        );
    }
}
