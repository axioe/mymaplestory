package com.mymaplestory.api.controller;

import com.mymaplestory.api.dto.CharacterCardResponse;
import com.mymaplestory.api.service.CharacterService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
