package com.mymaplestory.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 일일/주간 콘텐츠 목록에서 "이건 스킵할래" 체크한 항목을 캐릭터별로 저장한다.
 * 넥슨 데이터와는 무관한 순수 개인 표시라, 예전엔 localStorage에만 뒀는데
 * 기기를 바꾸면 사라지는 문제가 있어서 DB로 옮겼다.
 */
@Entity
@Table(
        name = "skip_records",
        uniqueConstraints = @UniqueConstraint(columnNames = {"character_name", "content_name"})
)
public class SkipRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "character_name", nullable = false, length = 64)
    private String characterName;

    @Column(name = "content_name", nullable = false, length = 128)
    private String contentName;

    protected SkipRecordEntity() {
        // JPA용 기본 생성자
    }

    public SkipRecordEntity(String characterName, String contentName) {
        this.characterName = characterName;
        this.contentName = contentName;
    }

    public Long getId() {
        return id;
    }

    public String getCharacterName() {
        return characterName;
    }

    public String getContentName() {
        return contentName;
    }
}
