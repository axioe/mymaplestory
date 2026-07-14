package com.mymaplestory.api.dto;

/**
 * 캐릭터 클릭 시 카드 형식으로 보여줄 응답.
 * 계획서 2번 항목 "캐릭터를 클릭 시, 카드 형식의 캐릭터의 레벨, 닉네임, 월드, 직업순으로 나오게끔 제작"에 대응.
 * 프론트엔드 CharacterSummaryCard 컴포넌트가 요구하는 필드(닉네임/서버/레벨/직업/인기도/길드)를 그대로 채운다.
 */
public record CharacterCardResponse(
        String characterName,
        String worldName,
        String characterClass,
        Integer characterLevel,
        String characterImage,
        Integer popularity,
        String guildName
) {
    public static CharacterCardResponse of(CharacterBasicDto basic, CharacterPopularityDto popularity) {
        return new CharacterCardResponse(
                basic.characterName(),
                basic.worldName(),
                basic.characterClass(),
                basic.characterLevel(),
                basic.characterImage(),
                popularity != null ? popularity.popularity() : null,
                basic.characterGuildName()
        );
    }
}
