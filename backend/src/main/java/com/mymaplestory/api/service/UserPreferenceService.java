package com.mymaplestory.api.service;

import com.mymaplestory.api.dto.BossSelectionDto;
import com.mymaplestory.api.dto.SkipDto;
import com.mymaplestory.api.entity.BossSelectionEntity;
import com.mymaplestory.api.entity.SkipRecordEntity;
import com.mymaplestory.api.repository.BossSelectionRepository;
import com.mymaplestory.api.repository.SkipRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 캐릭터별 개인 설정(보스 선택, 스킵 체크)을 DB에 저장/조회한다.
 * 넥슨 API와는 무관한, 순수하게 우리 서비스 안에서만 쓰는 개인 데이터다.
 * 예전엔 브라우저 localStorage에만 저장했는데, 기기를 바꾸면 사라지는 문제가
 * 있어서 DB로 옮겼다.
 */
@Service
public class UserPreferenceService {

    private final BossSelectionRepository bossSelectionRepository;
    private final SkipRecordRepository skipRecordRepository;

    public UserPreferenceService(BossSelectionRepository bossSelectionRepository, SkipRecordRepository skipRecordRepository) {
        this.bossSelectionRepository = bossSelectionRepository;
        this.skipRecordRepository = skipRecordRepository;
    }

    // ---- 보스 선택 ----

    public List<BossSelectionDto> getBossSelections(String characterName) {
        return bossSelectionRepository.findByCharacterName(characterName).stream()
                .map(e -> new BossSelectionDto(e.getBossName(), e.getDifficulty(), e.getPartySize(), e.getCycle()))
                .toList();
    }

    /**
     * 같은 캐릭터+보스 조합이 이미 있으면 난이도/인원수/주기를 덮어쓰고,
     * 없으면 새로 만든다(라디오 버튼처럼 보스 하나당 난이도 하나만 유지).
     */
    @Transactional
    public BossSelectionDto upsertBossSelection(String characterName, BossSelectionDto request) {
        BossSelectionEntity entity = bossSelectionRepository
                .findByCharacterNameAndBossName(characterName, request.bossName())
                .orElseGet(() -> new BossSelectionEntity(
                        characterName, request.bossName(), request.difficulty(), request.partySize(), request.cycle()
                ));
        entity.setDifficulty(request.difficulty());
        entity.setPartySize(request.partySize() != null ? request.partySize() : 1);
        entity.setCycle(request.cycle());
        BossSelectionEntity saved = bossSelectionRepository.save(entity);
        return new BossSelectionDto(saved.getBossName(), saved.getDifficulty(), saved.getPartySize(), saved.getCycle());
    }

    @Transactional
    public void deleteBossSelection(String characterName, String bossName) {
        bossSelectionRepository.deleteByCharacterNameAndBossName(characterName, bossName);
    }

    @Transactional
    public void resetBossSelections(String characterName) {
        bossSelectionRepository.deleteByCharacterName(characterName);
    }

    // ---- 스킵 체크 ----

    public List<SkipDto> getSkips(String characterName) {
        return skipRecordRepository.findByCharacterName(characterName).stream()
                .map(e -> new SkipDto(e.getContentName(), true))
                .toList();
    }

    /**
     * 존재 여부 자체가 "스킵됨"을 의미한다 - skipped=true면 없을 때만 새로 만들고,
     * skipped=false면 있으면 지운다.
     */
    @Transactional
    public void setSkip(String characterName, String contentName, boolean skipped) {
        var existing = skipRecordRepository.findByCharacterNameAndContentName(characterName, contentName);
        if (skipped) {
            if (existing.isEmpty()) {
                skipRecordRepository.save(new SkipRecordEntity(characterName, contentName));
            }
        } else {
            existing.ifPresent(skipRecordRepository::delete);
        }
    }
}
