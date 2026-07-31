package com.mymaplestory.api.dto;

import java.util.List;

public record UnionArtifactResponse(
        List<UnionArtifactEffect> effects,
        List<UnionArtifactCrystal> crystals,
        Integer remainAp
) {
    public static UnionArtifactResponse from(NexonUnionArtifactResponse raw) {
        if (raw == null) return null;
        List<UnionArtifactEffect> effects = raw.unionArtifactEffect() == null
                ? List.of()
                : raw.unionArtifactEffect().stream().map(UnionArtifactEffect::from).toList();
        List<UnionArtifactCrystal> crystals = raw.unionArtifactCrystal() == null
                ? List.of()
                : raw.unionArtifactCrystal().stream().map(UnionArtifactCrystal::from).toList();
        return new UnionArtifactResponse(effects, crystals, raw.unionArtifactRemainAp());
    }
}
