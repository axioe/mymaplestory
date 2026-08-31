package com.mymaplestory.api.repository;

import com.mymaplestory.api.entity.BossClearRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BossClearRecordRepository extends JpaRepository<BossClearRecordEntity, Long> {

    List<BossClearRecordEntity> findByCharacterNameAndWeekStartDate(String characterName, LocalDate weekStartDate);

    Optional<BossClearRecordEntity> findByCharacterNameAndBossNameAndWeekStartDate(
            String characterName, String bossName, LocalDate weekStartDate
    );

    void deleteByCharacterNameAndBossNameAndWeekStartDate(String characterName, String bossName, LocalDate weekStartDate);
}
