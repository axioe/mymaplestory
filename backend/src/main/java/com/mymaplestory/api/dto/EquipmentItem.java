package com.mymaplestory.api.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * 프론트엔드로 내려가는 장비 한 칸. 잠재능력 1~3줄을 낱개 필드 대신
 * 배열(potentialLines)로, 스텟도 statLines 배열로 정리해서 화면에서 다루기 쉽게 만든다.
 */
public record EquipmentItem(
        String part,
        String slot,
        String itemName,
        String itemIcon,
        String starforce,
        List<String> statLines,
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

        // item_shape_name/item_shape_icon(도안, "숨기기" 적용 시 겉모습)은 안 쓰고,
        // 항상 실제 아이템의 이름/아이콘(item_name/item_icon)을 그대로 보여준다 -
        // 이 화면은 실제 어떤 장비를 꼈는지 확인하는 용도라 겉모습보다 실제 아이템이 중요하다.
        return new EquipmentItem(
                item.itemEquipmentPart(),
                item.itemEquipmentSlot(),
                item.itemName(),
                item.itemIcon(),
                item.starforce(),
                buildStatLines(item.itemTotalOption()),
                item.potentialOptionGrade(),
                potential,
                item.additionalPotentialOptionGrade(),
                additionalPotential
        );
    }

    /**
     * 0이거나 없는 스텟은 화면에 보여줄 필요가 없어서 빼고, 실제 값이 있는
     * 스텟만 "STR +10" 같은 문구로 정리한다.
     */
    private static List<String> buildStatLines(NexonItemOption opt) {
        List<String> lines = new ArrayList<>();
        if (opt == null) return lines;
        addLine(lines, "STR", opt.str());
        addLine(lines, "DEX", opt.dex());
        addLine(lines, "INT", opt.intStat());
        addLine(lines, "LUK", opt.luk());
        addLine(lines, "최대 HP", opt.maxHp());
        addLine(lines, "최대 HP", opt.maxHpRate(), "%");
        addLine(lines, "최대 MP", opt.maxMp());
        addLine(lines, "최대 MP", opt.maxMpRate(), "%");
        addLine(lines, "공격력", opt.attackPower());
        addLine(lines, "마력", opt.magicPower());
        addLine(lines, "방어력", opt.armor());
        addLine(lines, "이동속도", opt.speed());
        addLine(lines, "점프력", opt.jump());
        addLine(lines, "올스탯", opt.allStat(), "%");
        addLine(lines, "보스 몬스터 데미지", opt.bossDamage(), "%");
        addLine(lines, "몬스터 방어율 무시", opt.ignoreMonsterArmor(), "%");
        addLine(lines, "데미지", opt.damage(), "%");
        return lines;
    }

    private static void addLine(List<String> lines, String label, String rawValue) {
        addLine(lines, label, rawValue, "");
    }

    private static void addLine(List<String> lines, String label, String rawValue, String suffix) {
        if (rawValue == null || rawValue.isBlank()) return;
        try {
            int value = Integer.parseInt(rawValue.trim());
            if (value == 0) return;
            String sign = value > 0 ? "+" : "";
            lines.add(label + " " + sign + value + suffix);
        } catch (NumberFormatException ignored) {
            // 혹시 정수가 아닌 값이 오면(예외적인 경우) 원본 그대로 보여준다.
            lines.add(label + " " + rawValue + suffix);
        }
    }
}
