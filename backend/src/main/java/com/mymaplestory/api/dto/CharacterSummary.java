package com.mymaplestory.api.dto;

public record CharacterSummary(
        String ocid,
        String characterName,
        String worldName,
        String characterClass,
        Integer characterLevel
) {
    public static CharacterSummary from(NexonCharacterSummary c) {
        return new CharacterSummary(c.ocid(), c.characterName(), c.worldName(), c.characterClass(), c.characterLevel());
    }
}
