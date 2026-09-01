package com.mymaplestory.api.dto;

import java.util.List;

/**
 * 프론트엔드로 내려가는 캐시 장비 응답. EquipmentPresetResponse와 같은 모양으로
 * 맞춰서, 프론트에서 프리셋 선택 로직(getPresetItems 등)을 그대로 재사용할 수 있게 한다.
 */
public record CashItemEquipmentResponse(
        String characterClass,
        Integer activePresetNo,
        List<CashItemEquipmentItem> defaultEquipment,
        List<CashItemEquipmentItem> preset1,
        List<CashItemEquipmentItem> preset2,
        List<CashItemEquipmentItem> preset3
) {
}
