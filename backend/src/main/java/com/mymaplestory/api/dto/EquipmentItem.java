package com.mymaplestory.api.dto;

import java.util.List;
import java.util.stream.Stream;

/**
 * 프론트엔드로 내려가는 장비 한 칸. 잠재능력 1~3줄을 낱개 필드 대신
 * 배열(potentialLines)로 정리해서 화면에서 다루기 쉽게 만든다.
 */
public record EquipmentItem(
        String part,
        String slot,
        String itemName,
        String itemIcon,
        String starforce,
        String potentialGrade,
        List<String> potentialLines,
        String additionalPotentialGrade,
        List<String> additionalPotentialLines
) {
    public static EquipmentItem from(NexonEquipmentItem item) {
        List<String> potential = Stream.of(item.potentialOption1(), item.potentialOption2(), item.potentialOption3())
                .filter(s -> s != null && !s.isBlank())
                .toList();
        List<String> additionalPotential = Stream.of(
                        item.additionalPotentialOption1(), item.additionalPotentialOption2(), item.additionalPotentialOption3()
                )
                .filter(s -> s != null && !s.isBlank())
                .toList();

        // 도안(item_shape_name)이 원래 이름과 다르면(작아 보이기 등 적용된 경우)
        // 그쪽이 실제로 보이는 겉모습이라 이름을 그걸로 보여준다.
        String displayName = item.itemShapeName() != null && !item.itemShapeName().isBlank()
                ? item.itemShapeName()
                : item.itemName();
        String displayIcon = item.itemShapeIcon() != null && !item.itemShapeIcon().isBlank()
                ? item.itemShapeIcon()
                : item.itemIcon();

        return new EquipmentItem(
                item.itemEquipmentPart(),
                item.itemEquipmentSlot(),
                displayName,
                displayIcon,
                item.starforce(),
                item.potentialOptionGrade(),
                potential,
                item.additionalPotentialOptionGrade(),
                additionalPotential
        );
    }
}
