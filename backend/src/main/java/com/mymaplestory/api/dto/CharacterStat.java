package com.mymaplestory.api.dto;

public record CharacterStat(String name, String value) {
    public static CharacterStat from(NexonFinalStat raw) {
        return new CharacterStat(raw.statName(), raw.statValue());
    }
}
