package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * union_raider_preset_1~5(배치판 좌표 정보로 추정)는 현재 실제 값이 항상 null로
 * 와서 구조를 몰라 DTO에 안 담는다 - 나중에 값이 채워진 예시가 확보되면 추가한다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonUnionRaiderResponse(
        String date,
        @JsonProperty("union_raider_stat") List<String> unionRaiderStat,
        @JsonProperty("union_occupied_stat") List<String> unionOccupiedStat,
        @JsonProperty("union_block") List<String> unionBlock,
        @JsonProperty("union_inner_stat") List<String> unionInnerStat,
        @JsonProperty("use_preset_no") Integer usePresetNo,
        @JsonProperty("union_state_stat") List<String> unionStateStat,
        @JsonProperty("union_state_stat_preset") List<NexonUnionStatePreset> unionStateStatPreset,
        @JsonProperty("union_max_point") Integer unionMaxPoint
) {
}
