package com.mymaplestory.api.dto;

public record UnionResponse(
        Integer unionLevel,
        String unionGrade,
        Integer unionArtifactLevel
) {
    public static UnionResponse from(NexonUnionResponse raw) {
        if (raw == null) return null;
        return new UnionResponse(
                raw.unionLevel(),
                raw.unionGrade(),
                raw.unionArtifactLevel()
        );
    }
}
