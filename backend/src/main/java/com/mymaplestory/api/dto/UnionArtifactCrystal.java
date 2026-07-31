package com.mymaplestory.api.dto;

import java.util.List;
import java.util.stream.Stream;

public record UnionArtifactCrystal(
        String name,
        Integer level,
        String dateExpire,
        List<String> options
) {
    public static UnionArtifactCrystal from(NexonUnionArtifactCrystal raw) {
        List<String> options = Stream.of(raw.crystalOptionName1(), raw.crystalOptionName2(), raw.crystalOptionName3())
                .filter(s -> s != null && !s.isBlank())
                .toList();
        return new UnionArtifactCrystal(raw.name(), raw.level(), raw.dateExpire(), options);
    }
}
