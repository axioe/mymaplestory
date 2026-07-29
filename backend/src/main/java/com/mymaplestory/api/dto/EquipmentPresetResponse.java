package com.mymaplestory.api.dto;

import java.util.List;

/**
 * 프론트엔드로 내려가는 장비 응답. 프리셋 3개를 한 번에 다 담아서, 프론트에서
 * 버튼(1/2/3)을 눌렀을 때 추가 API 호출 없이 바로 화면만 바꿔 보여줄 수 있게 한다.
 * defaultEquipment는 프리셋을 아예 안 쓰는 캐릭터를 위한 기본 장착 장비다.
 */
public record EquipmentPresetResponse(
        String characterClass,
        Integer activePresetNo,
        List<EquipmentItem> defaultEquipment,
        List<EquipmentItem> preset1,
        List<EquipmentItem> preset2,
        List<EquipmentItem> preset3
) {
}
