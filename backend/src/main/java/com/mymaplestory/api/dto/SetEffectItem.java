package com.mymaplestory.api.dto;

import java.util.List;

public record SetEffectItem(String setName, Integer totalSetCount, List<SetEffectInfo> setEffectInfo) {
    public static SetEffectItem from(NexonSetEffectItem item) {
        List<SetEffectInfo> info = item.setEffectInfo() == null
                ? List.of()
                : item.setEffectInfo().stream().map(SetEffectInfo::from).toList();
        return new SetEffectItem(item.setName(), item.totalSetCount(), info);
    }
}
