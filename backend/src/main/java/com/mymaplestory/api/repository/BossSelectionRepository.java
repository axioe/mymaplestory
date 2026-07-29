package com.mymaplestory.api.repository;

import com.mymaplestory.api.entity.BossSelectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BossSelectionRepository extends JpaRepository<BossSelectionEntity, Long> {

    List<BossSelectionEntity> findByCharacterName(String characterName);

    Optional<BossSelectionEntity> findByCharacterNameAndBossName(String characterName, String bossName);

    void deleteByCharacterNameAndBossName(String characterName, String bossName);

    void deleteByCharacterName(String characterName);
}
