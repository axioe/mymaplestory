package com.mymaplestory.api.dto;

public record BossContentItem(
        String contentName,
        String difficulty,
        String cycle,
        Long listOrderNo,
        String registrationFlag,
        String completeFlag
) {
    public static BossContentItem from(NexonBossContentItem item) {
        return new BossContentItem(
                item.contentName(),
                item.difficulty(),
                item.cycle(),
                item.listOrderNo(),
                item.registrationFlag(),
                item.completeFlag()
        );
    }
}
