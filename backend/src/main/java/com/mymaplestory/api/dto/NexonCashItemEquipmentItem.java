package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * /character/cashitem-equipment 응답 안의 캐시 장비 항목 하나(넥슨 원본, snake_case).
 * 넥슨 응답에는 옵션/컬러링프리즘/이펙트프리즘/스킬 등 필드가 더 있지만, 일단
 * 화면에 실제로 필요한 핵심 정보(이름/부위/아이콘/설명/유효기간)만 뽑아서 쓴다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonCashItemEquipmentItem(
        @JsonProperty("cash_item_equipment_part") String cashItemEquipmentPart,
        @JsonProperty("cash_item_equipment_slot") String cashItemEquipmentSlot,
        @JsonProperty("cash_item_name") String cashItemName,
        @JsonProperty("cash_item_icon") String cashItemIcon,
        @JsonProperty("cash_item_description") String cashItemDescription,
        @JsonProperty("date_expire") String dateExpire
) {
}
