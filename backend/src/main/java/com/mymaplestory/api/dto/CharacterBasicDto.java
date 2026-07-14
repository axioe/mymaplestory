package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * GET /character/basic 응답 매핑.
 * 계획서 "캐릭터 기본 정보 및 인기도 카드형식 조회"의 기본 정보 부분에 해당.
 *
 * 주의: character_guild_name 필드명은 오프라인 환경에서 작성되어
 * 넥슨 공식 문서(openapi.nexon.com)로 재확인하지 못했습니다.
 * 실제 응답과 다르면 필드명만 맞춰서 고쳐주세요 (없으면 null로 들어와도 무방).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CharacterBasicDto(
        @JsonProperty("character_name") String characterName,
        @JsonProperty("world_name") String worldName,
        @JsonProperty("character_gender") String characterGender,
        @JsonProperty("character_class") String characterClass,
        @JsonProperty("character_class_level") String characterClassLevel,
        @JsonProperty("character_level") Integer characterLevel,
        @JsonProperty("character_exp_rate") String characterExpRate,
        @JsonProperty("character_image") String characterImage,
        @JsonProperty("character_date_create") String characterDateCreate,
        @JsonProperty("character_guild_name") String characterGuildName
) {
}
