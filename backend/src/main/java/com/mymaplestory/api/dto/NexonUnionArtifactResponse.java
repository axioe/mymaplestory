package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonUnionArtifactResponse(
        String date,
        @JsonProperty("union_artifact_effect") List<NexonUnionArtifactEffect> unionArtifactEffect,
        @JsonProperty("union_artifact_crystal") List<NexonUnionArtifactCrystal> unionArtifactCrystal,
        @JsonProperty("union_artifact_remain_ap") Integer unionArtifactRemainAp
) {
}
