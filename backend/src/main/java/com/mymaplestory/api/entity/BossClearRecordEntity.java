package com.mymaplestory.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;

/**
 * "이번 주에 이 보스를 잡았다"를 캐릭터별로 저장한다. weekStartDate는 그 완료가
 * 속한 보스 주간의 시작일(가장 최근 목요일)이라, 다음 목요일이 지나면 새
 * weekStartDate로 조회하게 되어 자동으로 "미완료" 상태로 돌아간다(별도 초기화
 * 배치 없이, 존재하는 행이 없으면 그 주는 미완료라는 뜻).
 *
 * boss_selections(어떤 보스를 어떤 난이도/인원수로 잡을지 "계획")와는 완전히
 * 다른 개념이다 - 여기는 "실제로 잡았는지"만 기록한다. 난이도는 boss_selections
 * 쪽이 갖고 있으므로 이 행의 유니크 키에는 포함하지 않는다(같은 보스를 주중에
 * 난이도를 바꿔도 "이번 주 완료" 여부 자체는 유지된다).
 */
@Entity
@Table(
        name = "boss_clear_records",
        uniqueConstraints = @UniqueConstraint(columnNames = {"character_name", "boss_name", "week_start_date"})
)
public class BossClearRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "character_name", nullable = false, length = 64)
    private String characterName;

    @Column(name = "boss_name", nullable = false, length = 64)
    private String bossName;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    protected BossClearRecordEntity() {
        // JPA용 기본 생성자
    }

    public BossClearRecordEntity(String characterName, String bossName, LocalDate weekStartDate) {
        this.characterName = characterName;
        this.bossName = bossName;
        this.weekStartDate = weekStartDate;
    }

    public Long getId() {
        return id;
    }

    public String getCharacterName() {
        return characterName;
    }

    public String getBossName() {
        return bossName;
    }

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }
}
