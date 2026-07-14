package com.mymaplestory.api.service;

import com.mymaplestory.api.config.NexonApiProperties;
import com.mymaplestory.api.dto.CharacterBasicDto;
import com.mymaplestory.api.dto.CharacterPopularityDto;
import com.mymaplestory.api.dto.OcidResponse;
import com.mymaplestory.api.exception.ApiKeyRequiredException;
import com.mymaplestory.api.exception.InvalidApiKeyException;
import com.mymaplestory.api.exception.NexonApiException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * 넥슨 메이플스토리 오픈 API 연동 서비스.
 * 문서: https://openapi.nexon.com/game/maplestory/
 *
 * 참고: 넥슨 오픈 API는 "회원 로그인(OAuth)"이 아니라 공개 게임 데이터 조회용 API입니다.
 * 이 서비스는 로그인을 제공하지 않는 대신, 사용자가 프론트엔드에 직접 입력한
 * 자신의 넥슨 API 키를 매 요청(X-Nexon-Api-Key 헤더)마다 전달받아 사용한다.
 */
@Service
public class NexonApiService {

    private final RestClient nexonRestClient;
    private final NexonApiProperties properties;

    public NexonApiService(RestClient nexonRestClient, NexonApiProperties properties) {
        this.nexonRestClient = nexonRestClient;
        this.properties = properties;
    }

    /**
     * 요청 헤더로 전달된 키를 우선 사용하고, 없으면(로컬 개발 편의를 위해)
     * application.yml / NEXON_API_KEY 환경변수로 설정된 서버 기본 키로 대체한다.
     * 둘 다 없으면 예외를 던진다.
     */
    private String resolveApiKey(String requestApiKey) {
        if (StringUtils.hasText(requestApiKey)) {
            return requestApiKey;
        }
        if (StringUtils.hasText(properties.getKey())) {
            return properties.getKey();
        }
        throw new ApiKeyRequiredException("넥슨 API 키가 필요합니다. X-Nexon-Api-Key 헤더로 전달해주세요.");
    }

    /**
     * 캐릭터 조회 없이 키 자체의 유효성만 가볍게 확인한다.
     * 넥슨 오픈 API의 공지사항 조회(/notice)는 캐릭터 정보 없이 키만 있으면 호출되므로
     * 검증용으로 사용한다. 401/403이면 키가 잘못된 것으로 판단한다.
     *
     * 주의: 이 프로젝트는 오프라인 환경에서 작성되어 /notice 엔드포인트 스펙을
     * 넥슨 공식 문서로 재확인하지 못했습니다. 실제 배포 전 반드시
     * https://openapi.nexon.com 문서에서 최신 경로를 확인해주세요.
     */
    public void validateApiKey(String requestApiKey) {
        String apiKey = resolveApiKey(requestApiKey);
        try {
            nexonRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/notice")
                            .queryParam("page", 1)
                            .queryParam("count", 1)
                            .build())
                    .header("x-nexon-api-key", apiKey)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
                throw new InvalidApiKeyException("유효하지 않은 넥슨 API 키입니다.");
            }
            throw new NexonApiException("넥슨 API 키 확인 중 오류: " + e.getStatusCode(), e);
        }
    }

    /**
     * 캐릭터명 -> ocid 변환. 이후 모든 조회의 시작점.
     */
    public String getOcid(String characterName, String requestApiKey) {
        String apiKey = resolveApiKey(requestApiKey);
        try {
            OcidResponse response = nexonRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/id")
                            .queryParam("character_name", characterName)
                            .build())
                    .header("x-nexon-api-key", apiKey)
                    .retrieve()
                    .body(OcidResponse.class);

            if (response == null || response.ocid() == null) {
                throw new NexonApiException("캐릭터를 찾을 수 없습니다: " + characterName);
            }
            return response.ocid();
        } catch (RestClientResponseException e) {
            throw new NexonApiException("넥슨 API 조회 실패 (ocid): " + e.getStatusCode(), e);
        }
    }

    public CharacterBasicDto getBasicInfo(String ocid, String requestApiKey) {
        String apiKey = resolveApiKey(requestApiKey);
        try {
            return nexonRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/character/basic")
                            .queryParam("ocid", ocid)
                            .build())
                    .header("x-nexon-api-key", apiKey)
                    .retrieve()
                    .body(CharacterBasicDto.class);
        } catch (RestClientResponseException e) {
            throw new NexonApiException("넥슨 API 조회 실패 (basic): " + e.getStatusCode(), e);
        }
    }

    public CharacterPopularityDto getPopularity(String ocid, String requestApiKey) {
        String apiKey = resolveApiKey(requestApiKey);
        try {
            return nexonRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/character/popularity")
                            .queryParam("ocid", ocid)
                            .build())
                    .header("x-nexon-api-key", apiKey)
                    .retrieve()
                    .body(CharacterPopularityDto.class);
        } catch (RestClientResponseException e) {
            throw new NexonApiException("넥슨 API 조회 실패 (popularity): " + e.getStatusCode(), e);
        }
    }
}
