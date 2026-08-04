package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * union_raider_preset_1~5는 과거 방식의 유니온 공격대 배치판 필드로 보이며, 실제
 * 값이 항상 null로 온다 - 지금은 union_state_stat_preset[].presetNo(1~10) 쪽으로
 * 대체된 것으로 보여, 의도적으로 DTO에 담지 않는다(추후 구현 계획 없음).
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
