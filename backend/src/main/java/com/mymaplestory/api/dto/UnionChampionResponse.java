package com.mymaplestory.api.dto;

import java.util.List;

public record UnionChampionResponse(
        List<UnionChampion> champions,
        List<String> totalBadges
) {
    public static UnionChampionResponse from(NexonUnionChampionResponse raw) {
        if (raw == null) return null;
        List<UnionChampion> champions = raw.unionChampion() == null
                ? List.of()
                : raw.unionChampion().stream().map(UnionChampion::from).toList();
        List<String> totalBadges = raw.championBadgeTotalInfo() == null
                ? List.of()
                : raw.championBadgeTotalInfo().stream().map(NexonUnionBadge::stat).toList();
        return new UnionChampionResponse(champions, totalBadges);
    }
}
