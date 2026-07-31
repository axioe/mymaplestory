package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonUnionResponse(
        String date,
        @JsonProperty("union_level") Integer unionLevel,
        @JsonProperty("union_grade") String unionGrade,
        @JsonProperty("union_artifact_level") Integer unionArtifactLevel,
        @JsonProperty("union_artifact_exp") Integer unionArtifactExp,
        @JsonProperty("union_artifact_point") Integer unionArtifactPoint
) {
}
