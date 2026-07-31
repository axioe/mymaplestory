package com.mymaplestory.api.dto;

import java.util.List;

public record UnionRaiderResponse(
        List<String> raiderStats,
        List<String> occupiedStats,
        List<String> stateStats,
        List<UnionStatePreset> stateStatPresets,
        Integer maxPoint
) {
    public static UnionRaiderResponse from(NexonUnionRaiderResponse raw) {
        if (raw == null) return null;
        List<UnionStatePreset> presets = raw.unionStateStatPreset() == null
                ? List.of()
                : raw.unionStateStatPreset().stream().map(UnionStatePreset::from).toList();
        return new UnionRaiderResponse(
                raw.unionRaiderStat(),
                raw.unionOccupiedStat(),
                raw.unionStateStat(),
                presets,
                raw.unionMaxPoint()
        );
    }
}
