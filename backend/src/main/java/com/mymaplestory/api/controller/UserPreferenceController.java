package com.mymaplestory.api.controller;

import com.mymaplestory.api.dto.BossSelectionDto;
import com.mymaplestory.api.dto.SkipDto;
import com.mymaplestory.api.service.UserPreferenceService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 캐릭터별 개인 설정(보스 선택, 스킵 체크) - 넥슨 API와 무관하게 우리 DB에
 * 저장/조회한다. 넥슨 API 키가 필요 없는 순수 내부 데이터라서 이 컨트롤러의
 * 엔드포인트에는 X-Nexon-Api-Key 헤더가 필요 없다.
 */
@RestController
@RequestMapping("/api/characters/{characterName}")
public class UserPreferenceController {

    private final UserPreferenceService userPreferenceService;

    public UserPreferenceController(UserPreferenceService userPreferenceService) {
        this.userPreferenceService = userPreferenceService;
    }

    // ---- 보스 선택 ----

    @GetMapping("/boss-selections")
    public List<BossSelectionDto> getBossSelections(@PathVariable String characterName) {
        return userPreferenceService.getBossSelections(characterName);
    }

    @PutMapping("/boss-selections")
    public BossSelectionDto upsertBossSelection(@PathVariable String characterName, @RequestBody BossSelectionDto request) {
        return userPreferenceService.upsertBossSelection(characterName, request);
    }

    @DeleteMapping("/boss-selections/{bossName}")
    public void deleteBossSelection(@PathVariable String characterName, @PathVariable String bossName) {
        userPreferenceService.deleteBossSelection(characterName, bossName);
    }

    @DeleteMapping("/boss-selections")
    public void resetBossSelections(@PathVariable String characterName) {
        userPreferenceService.resetBossSelections(characterName);
    }

    // ---- 스킵 체크 ----

    @GetMapping("/skips")
    public List<SkipDto> getSkips(@PathVariable String characterName) {
        return userPreferenceService.getSkips(characterName);
    }

    @PutMapping("/skips/{contentName}")
    public void setSkip(
            @PathVariable String characterName,
            @PathVariable String contentName,
            @RequestBody SkipDto request
    ) {
        userPreferenceService.setSkip(characterName, contentName, request.skipped());
    }
}
