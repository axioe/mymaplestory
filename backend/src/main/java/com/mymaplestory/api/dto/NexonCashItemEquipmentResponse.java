package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * GET /character/cashitem-equipment 원본 응답. item-equipment와 마찬가지로
 * 코디 프리셋(1/2/3) 각각의 캐시 장비 목록이 한 번의 호출에 다 같이 내려오고,
 * cash_item_equipment_base는 프리셋을 안 쓰는 경우의 기본 착용 캐시 장비다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonCashItemEquipmentResponse(
        String date,
        @JsonProperty("character_class") String characterClass,
        @JsonProperty("preset_no") Integer presetNo,
        @JsonProperty("cash_item_equipment_base") List<NexonCashItemEquipmentItem> cashItemEquipmentBase,
        @JsonProperty("cash_item_equipment_preset_1") List<NexonCashItemEquipmentItem> cashItemEquipmentPreset1,
        @JsonProperty("cash_item_equipment_preset_2") List<NexonCashItemEquipmentItem> cashItemEquipmentPreset2,
        @JsonProperty("cash_item_equipment_preset_3") List<NexonCashItemEquipmentItem> cashItemEquipmentPreset3
) {
}
