package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonFinalStat(
        @JsonProperty("stat_name") String statName,
        @JsonProperty("stat_value") String statValue
) {
}
