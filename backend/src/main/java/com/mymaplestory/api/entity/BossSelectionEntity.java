package com.mymaplestory.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * "이번 주에 이 보스는 이 난이도로, 몇 명이서 잡을 거야"를 캐릭터별로 저장한다.
 * 넥슨 API는 이런 계획을 저장할 방법이 없어서 우리 DB에 따로 둔다.
 * 예전엔 브라우저 localStorage에만 저장했는데, 기기를 바꾸면 사라지는 문제가
 * 있어서 DB로 옮겼다. 보스 하나(characterName + bossName)당 한 행만 존재하고,
 * 난이도를 바꾸면 그 행을 덮어쓴다(라디오 버튼과 같은 동작).
 */
@Entity
@Table(
        name = "boss_selections",
        uniqueConstraints = @UniqueConstraint(columnNames = {"character_name", "boss_name"})
)
public class BossSelectionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "character_name", nullable = false, length = 64)
    private String characterName;

    @Column(name = "boss_name", nullable = false, length = 64)
    private String bossName;

    @Column(name = "difficulty", nullable = false, length = 32)
    private String difficulty;

    @Column(name = "party_size", nullable = false)
    private Integer partySize = 1;

    @Column(name = "cycle", nullable = false, length = 16)
    private String cycle;

    protected BossSelectionEntity() {
        // JPA용 기본 생성자
    }

    public BossSelectionEntity(String characterName, String bossName, String difficulty, Integer partySize, String cycle) {
        this.characterName = characterName;
        this.bossName = bossName;
        this.difficulty = difficulty;
        this.partySize = partySize;
        this.cycle = cycle;
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

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getPartySize() {
        return partySize;
    }

    public void setPartySize(Integer partySize) {
        this.partySize = partySize;
    }

    public String getCycle() {
        return cycle;
    }

    public void setCycle(String cycle) {
        this.cycle = cycle;
    }
}
