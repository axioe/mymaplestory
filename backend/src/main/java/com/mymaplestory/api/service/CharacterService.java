package com.mymaplestory.api.service;

import com.mymaplestory.api.dto.CharacterBasicDto;
import com.mymaplestory.api.dto.CharacterCardResponse;
import com.mymaplestory.api.dto.CharacterPopularityDto;
import org.springframework.stereotype.Service;

@Service
public class CharacterService {

    private final NexonApiService nexonApiService;

    public CharacterService(NexonApiService nexonApiService) {
        this.nexonApiService = nexonApiService;
    }

    /**
     * 캐릭터 클릭 시 카드 형식으로 내려줄 데이터 조합.
     * apiKey: 프론트에서 전달한 사용자의 넥슨 API 키 (null이면 서버 기본 키로 대체 시도).
     */
    public CharacterCardResponse getCharacterCard(String characterName, String apiKey) {
        String ocid = nexonApiService.getOcid(characterName, apiKey);
        CharacterBasicDto basic = nexonApiService.getBasicInfo(ocid, apiKey);
        CharacterPopularityDto popularity = nexonApiService.getPopularity(ocid, apiKey);
        return CharacterCardResponse.of(basic, popularity);
    }
}
