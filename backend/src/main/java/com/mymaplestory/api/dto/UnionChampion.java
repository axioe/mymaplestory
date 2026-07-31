package com.mymaplestory.api.dto;

import java.util.List;

public record UnionChampion(
        String name,
        Integer slot,
        String grade,
        String className,
        List<String> badges
) {
    public static UnionChampion from(NexonUnionChampion raw) {
        List<String> badges = raw.championBadgeInfo() == null
                ? List.of()
                : raw.championBadgeInfo().stream().map(NexonUnionBadge::stat).toList();
        return new UnionChampion(raw.championName(), raw.championSlot(), raw.championGrade(), raw.championClass(), badges);
    }
}
