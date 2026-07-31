package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonUnionStatePreset(
        @JsonProperty("preset_no") Integer presetNo,
        @JsonProperty("union_state_stat") List<String> unionStateStat
) {
}
