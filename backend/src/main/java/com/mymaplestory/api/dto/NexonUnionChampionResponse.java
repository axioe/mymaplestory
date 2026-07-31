package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonUnionChampionResponse(
        String date,
        @JsonProperty("union_champion") List<NexonUnionChampion> unionChampion,
        @JsonProperty("champion_badge_total_info") List<NexonUnionBadge> championBadgeTotalInfo
) {
}
