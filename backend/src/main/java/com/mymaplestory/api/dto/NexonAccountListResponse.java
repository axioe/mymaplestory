package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * GET /character/list 원본 응답. 넥슨 계정(하나의 API 키) 아래 연결된 여러
 * 넥슨ID(account) 각각의 캐릭터 목록을 다 내려준다 - 보통은 계정이 하나뿐이라
 * account_list 배열엔 항목이 하나만 들어있는 경우가 많지만, 여러 개일 수도 있다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonAccountListResponse(
        @JsonProperty("account_list") List<NexonAccountEntry> accountList
) {
}
