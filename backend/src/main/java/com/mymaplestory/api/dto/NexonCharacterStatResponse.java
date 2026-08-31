package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * GET /character/stat 원본 응답 (문서: https://openapi.nexon.com/ko/game/maplestory/?id=13).
 * 스탯 하나하나가 고정된 필드가 아니라 {stat_name, stat_value} 쌍의 목록으로 내려온다
 * (STR/DEX/INT/LUK부터 전투력, 보스 몬스터 데미지 % 등 수십 개).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonCharacterStatResponse(
        String date,
        @JsonProperty("character_class") String characterClass,
        @JsonProperty("final_stat") List<NexonFinalStat> finalStat,
        @JsonProperty("remain_ap") Integer remainAp
) {
}
