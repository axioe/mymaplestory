package com.mymaplestory.api.dto;

public record UnionArtifactEffect(String name, Integer level) {
    public static UnionArtifactEffect from(NexonUnionArtifactEffect raw) {
        return new UnionArtifactEffect(raw.name(), raw.level());
    }
}
