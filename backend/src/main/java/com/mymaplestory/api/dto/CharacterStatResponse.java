package com.mymaplestory.api.dto;

import java.util.List;

public record CharacterStatResponse(
        String characterName,
        String characterClass,
        List<CharacterStat> stats
) {
    public static CharacterStatResponse of(String characterName, NexonCharacterStatResponse raw) {
        List<CharacterStat> stats = raw == null || raw.finalStat() == null
                ? List.of()
                : raw.finalStat().stream().map(CharacterStat::from).toList();
        return new CharacterStatResponse(characterName, raw != null ? raw.characterClass() : null, stats);
    }
}
