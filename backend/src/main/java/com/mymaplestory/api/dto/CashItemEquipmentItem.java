package com.mymaplestory.api.dto;

/**
 * 프론트엔드로 내려가는 캐시 장비 한 칸.
 */
public record CashItemEquipmentItem(
        String part,
        String slot,
        String itemName,
        String itemIcon,
        String description,
        String dateExpire
) {
    public static CashItemEquipmentItem from(NexonCashItemEquipmentItem item) {
        return new CashItemEquipmentItem(
                item.cashItemEquipmentPart(),
                item.cashItemEquipmentSlot(),
                item.cashItemName(),
                item.cashItemIcon(),
                item.cashItemDescription(),
                normalizeDateExpire(item.dateExpire())
        );
    }

    /**
     * 넥슨 응답의 date_expire는 실제 만료 일시 문자열이 오거나, 리터럴 문자열
     * "expired"가 오기도 한다("expired"의 정확한 의미가 공식 문서에 명시돼 있지
     * 않고, 커뮤니티 라이브러리마다 해석이 갈려서 - 영구 아이템이라는 설과 이미
     * 만료됐다는 설이 둘 다 있음). 지금 장착 중인 장비 응답에 실제로 만료된
     * 아이템이 섞여 나올 이유가 없어서, 의미가 불확실한 "expired" 값은 화면에
     * 잘못된 문구로 단정하지 않고 그냥 없는 것처럼(null) 처리한다.
     */
    private static String normalizeDateExpire(String rawDateExpire) {
        return "expired".equals(rawDateExpire) ? null : rawDateExpire;
    }
}
