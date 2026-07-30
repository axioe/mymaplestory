package com.mymaplestory.api.dto;

import java.util.List;

/**
 * 프론트엔드로 내려가는 "이 API 키 계정에 연결된 전체 캐릭터 목록".
 * 넥슨 원본은 넥슨ID(계정)별로 나뉘어 있지만, 화면에서는 그냥 캐릭터
 * 하나하나를 월드별로 묶어서 보여주면 되므로 여기서 하나의 리스트로 합친다.
 */
public record CharacterListResponse(List<CharacterSummary> characters) {
}
