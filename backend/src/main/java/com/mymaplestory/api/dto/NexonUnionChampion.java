package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonUnionChampion(
        @JsonProperty("champion_name") String championName,
        @JsonProperty("champion_slot") Integer championSlot,
        @JsonProperty("champion_grade") String championGrade,
        @JsonProperty("champion_class") String championClass,
        @JsonProperty("champion_badge_info") List<NexonUnionBadge> championBadgeInfo
) {
}
