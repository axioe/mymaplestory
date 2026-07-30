package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonAccountEntry(
        @JsonProperty("account_id") String accountId,
        @JsonProperty("character_list") List<NexonCharacterSummary> characterList
) {
}
