package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * GET /character/item-equipment 원본 응답. 프리셋(1/2/3) 슬롯 각각의 장비 목록이
 * 한 번의 호출에 다 같이 내려오고, item_equipment는 프리셋을 안 쓰는 경우의
 * 기본 장착 장비다. preset_no는 인게임에서 지금 활성화된 프리셋 번호.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonItemEquipmentResponse(
        String date,
        @JsonProperty("character_class") String characterClass,
        @JsonProperty("preset_no") Integer presetNo,
        @JsonProperty("item_equipment") List<NexonEquipmentItem> itemEquipment,
        @JsonProperty("item_equipment_preset_1") List<NexonEquipmentItem> itemEquipmentPreset1,
        @JsonProperty("item_equipment_preset_2") List<NexonEquipmentItem> itemEquipmentPreset2,
        @JsonProperty("item_equipment_preset_3") List<NexonEquipmentItem> itemEquipmentPreset3
) {
}
