package com.mymaplestory.api.service;

import com.mymaplestory.api.dto.CharacterBasicDto;
import com.mymaplestory.api.dto.CharacterCardResponse;
import com.mymaplestory.api.dto.CharacterPopularityDto;
import com.mymaplestory.api.dto.EquipmentPresetResponse;
import com.mymaplestory.api.dto.LevelHistoryResponse;
import com.mymaplestory.api.dto.SchedulerResponse;
import com.mymaplestory.api.dto.SetEffectResponse;
import com.mymaplestory.api.dto.UnionArtifactResponse;
import com.mymaplestory.api.dto.UnionChampionResponse;
import com.mymaplestory.api.dto.UnionRaiderResponse;
import com.mymaplestory.api.dto.UnionResponse;
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

    /**
     * 아카이브 - 레벨 카테고리용 레벨/경험치 히스토리.
     */
    public LevelHistoryResponse getLevelHistory(String characterName, String apiKey, int days) {
        return nexonApiService.getLevelHistory(characterName, apiKey, days);
    }

    /**
     * 아카이브 - 스케줄러 카테고리용 달성 현황.
     */
    public SchedulerResponse getScheduler(String characterName, String apiKey) {
        return nexonApiService.getScheduler(characterName, apiKey);
    }

    /**
     * 아카이브 - 전리품 카테고리용 장착장비(프리셋 1/2/3 포함).
     */
    public EquipmentPresetResponse getItemEquipment(String characterName, String apiKey) {
        return nexonApiService.getItemEquipment(characterName, apiKey);
    }

    /**
     * 아카이브 - 전리품 카테고리용 적용 세트효과.
     */
    public SetEffectResponse getSetEffect(String characterName, String apiKey) {
        return nexonApiService.getSetEffect(characterName, apiKey);
    }

    /**
     * 아카이브 - 유니온 카테고리용 4종 조회 (기본 정보/공격대/아티팩트/챔피언).
     */
    public UnionResponse getUnion(String characterName, String apiKey) {
        return nexonApiService.getUnion(characterName, apiKey);
    }

    public UnionRaiderResponse getUnionRaider(String characterName, String apiKey) {
        return nexonApiService.getUnionRaider(characterName, apiKey);
    }

    public UnionArtifactResponse getUnionArtifact(String characterName, String apiKey) {
        return nexonApiService.getUnionArtifact(characterName, apiKey);
    }

    public UnionChampionResponse getUnionChampion(String characterName, String apiKey) {
        return nexonApiService.getUnionChampion(characterName, apiKey);
    }
}
