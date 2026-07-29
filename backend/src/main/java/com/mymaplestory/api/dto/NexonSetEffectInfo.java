package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonSetEffectInfo(
        @JsonProperty("set_count") Integer setCount,
        @JsonProperty("set_option") String setOption
) {
}
