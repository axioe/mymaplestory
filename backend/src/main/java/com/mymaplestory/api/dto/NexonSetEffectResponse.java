package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonSetEffectResponse(
        String date,
        @JsonProperty("set_effect") List<NexonSetEffectItem> setEffect
) {
}
