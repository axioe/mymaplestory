package com.mymaplestory.api.dto;

import java.util.List;

public record UnionStatePreset(Integer presetNo, List<String> stateStats) {
    public static UnionStatePreset from(NexonUnionStatePreset raw) {
        return new UnionStatePreset(raw.presetNo(), raw.unionStateStat());
    }
}
