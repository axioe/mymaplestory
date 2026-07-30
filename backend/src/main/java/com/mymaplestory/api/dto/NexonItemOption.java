package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * item_total_option / item_base_option 안의 스텟 값들(넥슨 원본, 전부 문자열로 온다).
 * "int"는 자바 예약어라 필드명은 intStat으로 받고 JSON 키만 "int"로 매핑한다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonItemOption(
        String str,
        String dex,
        @JsonProperty("int") String intStat,
        String luk,
        @JsonProperty("max_hp") String maxHp,
        @JsonProperty("max_mp") String maxMp,
        @JsonProperty("attack_power") String attackPower,
        @JsonProperty("magic_power") String magicPower,
        String armor,
        String speed,
        String jump,
        @JsonProperty("boss_damage") String bossDamage,
        @JsonProperty("ignore_monster_armor") String ignoreMonsterArmor,
        @JsonProperty("all_stat") String allStat,
        String damage,
        @JsonProperty("max_hp_rate") String maxHpRate,
        @JsonProperty("max_mp_rate") String maxMpRate
) {
}
