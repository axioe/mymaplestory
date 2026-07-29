package com.mymaplestory.api.repository;

import com.mymaplestory.api.entity.SkipRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkipRecordRepository extends JpaRepository<SkipRecordEntity, Long> {

    List<SkipRecordEntity> findByCharacterName(String characterName);

    Optional<SkipRecordEntity> findByCharacterNameAndContentName(String characterName, String contentName);

    void deleteByCharacterNameAndContentName(String characterName, String contentName);
}
