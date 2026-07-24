package com.mymaplestory.api.controller;

import com.mymaplestory.api.dto.CharacterCardResponse;
import com.mymaplestory.api.dto.LevelHistoryResponse;
import com.mymaplestory.api.dto.SchedulerResponse;
import com.mymaplestory.api.service.CharacterService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    /**
     * 예: GET /api/characters/체리톡톡/card
     * 헤더: X-Nexon-Api-Key: <사용자가 프론트에서 입력한 개인 넥슨 API 키>
     * (헤더가 없으면 서버에 NEXON_API_KEY 환경변수가 설정된 경우에 한해 그 값으로 대체 시도)
     */
    @GetMapping("/{characterName}/card")
    public CharacterCardResponse getCharacterCard(
            @PathVariable String characterName,
            @RequestHeader(value = "X-Nexon-Api-Key", required = false) String apiKey
    ) {
        return characterService.getCharacterCard(characterName, apiKey);
    }

    /**
     * 예: GET /api/characters/체리톡톡/level-history?days=30
     * 가장 최근 레벨업이 언제였는지(날짜 + 그날짜로부터 며칠 지났는지)를 찾아서 내려준다.
     * days는 "몇 일 전까지 거슬러 올라가며 찾아볼지"를 뜻한다. 늘어날수록 넥슨 API를
     * 그만큼 여러 번 순차 호출하므로 응답이 느려질 수 있어 최대 60일로 제한한다.
     * 그 범위 안에서 레벨업 기록을 못 찾으면 levelUpDate가 null로 내려간다.
     */
    @GetMapping("/{characterName}/level-history")
    public LevelHistoryResponse getLevelHistory(
            @PathVariable String characterName,
            @RequestParam(defaultValue = "30") int days,
            @RequestHeader(value = "X-Nexon-Api-Key", required = false) String apiKey
    ) {
        int safeDays = Math.max(1, Math.min(days, 60));
        return characterService.getLevelHistory(characterName, apiKey, safeDays);
    }

    /**
     * 예: GET /api/characters/체리톡톡/scheduler
     * 캐릭터의 메이플 스케줄러 달성 현황 중 daily_contents, boss_contents,
     * weekly_boss_clear_count, weekly_boss_clear_limit_count만 내려준다.
     */
    @GetMapping("/{characterName}/scheduler")
    public SchedulerResponse getScheduler(
            @PathVariable String characterName,
            @RequestHeader(value = "X-Nexon-Api-Key", required = false) String apiKey
    ) {
        return characterService.getScheduler(characterName, apiKey);
    }
}
