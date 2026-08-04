package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * union_artifact_exp/union_artifact_point는 화면에서 더 이상 쓰지 않기로 해서
 * 뺐다 (ignoreUnknown = true라 넥슨이 계속 내려줘도 그냥 무시된다).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonUnionResponse(
        String date,
        @JsonProperty("union_level") Integer unionLevel,
        @JsonProperty("union_grade") String unionGrade,
        @JsonProperty("union_artifact_level") Integer unionArtifactLevel
) {
}
