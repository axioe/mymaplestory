package com.mymaplestory.api.dto;

public record SetEffectInfo(Integer setCount, String setOption) {
    public static SetEffectInfo from(NexonSetEffectInfo info) {
        return new SetEffectInfo(info.setCount(), info.setOption());
    }
}
