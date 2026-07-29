package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonSetEffectItem(
        @JsonProperty("set_name") String setName,
        @JsonProperty("total_set_count") Integer totalSetCount,
        @JsonProperty("set_effect_info") List<NexonSetEffectInfo> setEffectInfo
) {
}
