package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * /character/item-equipment 응답 안의 장비 항목 하나(넥슨 원본, snake_case).
 * 넥슨 응답 필드가 매우 많은데(옵션 종류만 수십 개), 일단 화면에 실제로 필요한
 * 핵심 정보(이름/부위/스타포스/잠재능력)만 뽑아서 쓴다. 나중에 더 필요한 필드가
 * 생기면 여기에 @JsonProperty만 추가하면 된다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonEquipmentItem(
        @JsonProperty("item_equipment_part") String itemEquipmentPart,
        @JsonProperty("item_equipment_slot") String itemEquipmentSlot,
        @JsonProperty("item_name") String itemName,
        @JsonProperty("item_icon") String itemIcon,
        @JsonProperty("item_shape_name") String itemShapeName,
        @JsonProperty("item_shape_icon") String itemShapeIcon,
        String starforce,
        @JsonProperty("potential_option_grade") String potentialOptionGrade,
        @JsonProperty("potential_option_1") String potentialOption1,
        @JsonProperty("potential_option_2") String potentialOption2,
        @JsonProperty("potential_option_3") String potentialOption3,
        @JsonProperty("additional_potential_option_grade") String additionalPotentialOptionGrade,
        @JsonProperty("additional_potential_option_1") String additionalPotentialOption1,
        @JsonProperty("additional_potential_option_2") String additionalPotentialOption2,
        @JsonProperty("additional_potential_option_3") String additionalPotentialOption3
) {
}
