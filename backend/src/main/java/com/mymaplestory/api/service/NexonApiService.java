package com.mymaplestory.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mymaplestory.api.config.NexonApiProperties;
import com.mymaplestory.api.dto.CharacterBasicDto;
import com.mymaplestory.api.dto.CharacterPopularityDto;
import com.mymaplestory.api.dto.LevelHistoryEntry;
import com.mymaplestory.api.dto.LevelHistoryResponse;
import com.mymaplestory.api.dto.LevelUpEvent;
import com.mymaplestory.api.dto.NexonErrorResponse;
import com.mymaplestory.api.dto.OcidResponse;
import com.mymaplestory.api.exception.ApiKeyRequiredException;
import com.mymaplestory.api.exception.InvalidApiKeyException;
import com.mymaplestory.api.exception.NexonApiException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 넥슨 메이플스토리 오픈 API 연동 서비스.
 * 문서: https://openapi.nexon.com/game/maplestory/
 *
 * 참고: 넥슨 오픈 API는 "회원 로그인(OAuth)"이 아니라 공개 게임 데이터 조회용 API입니다.
 * 이 서비스는 로그인을 제공하지 않는 대신, 사용자가 프론트엔드에 직접 입력한
 * 자신의 넥슨 API 키를 매 요청(X-Nexon-Api-Key 헤더)마다 전달받아 사용한다.
 *
 * 중요: 넥슨 API에 실제로 보내는 인증 헤더 이름은 "x-nxopen-api-key" 이다.
 * (프론트에서 우리 서버로 보내는 "X-Nexon-Api-Key"와는 별개 - 그건 우리 서비스
 * 내부 규약이고, 넥슨 서버로 나가는 요청에는 반드시 x-nxopen-api-key를 써야 한다.)
 */
@Service
public class NexonApiService {

    private static final String NEXON_AUTH_HEADER = "x-nxopen-api-key";
    private static final String INVALID_KEY_ERROR_CODE = "OPENAPI00005";

    private final RestClient nexonRestClient;
    private final NexonApiProperties properties;
    private final ObjectMapper objectMapper;

    public NexonApiService(RestClient nexonRestClient, NexonApiProperties properties, ObjectMapper objectMapper) {
        this.nexonRestClient = nexonRestClient;
        this.properties = properties;
        this.objectMapper = objectMapper;
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
     * 넥슨 에러 응답 본문에서 error.name 값을 꺼낸다. 파싱 실패 시 null.
     * (넥슨은 유효하지 않은 키/경로/파라미터/식별자를 전부 400번대로 내려주면서
     * 본문의 error.name 코드로만 구분하는 경우가 있어, 상태코드만으로는 원인을 알 수 없다.)
     */
    private String extractErrorCode(RestClientResponseException e) {
        try {
            NexonErrorResponse body = objectMapper.readValue(e.getResponseBodyAsString(), NexonErrorResponse.class);
            return body.error() != null ? body.error().name() : null;
        } catch (Exception parseError) {
            return null;
        }
    }

    /**
     * 캐릭터 조회 없이 키 자체의 유효성만 확인한다.
     * 확실하게 문서화되어 있는 /id 엔드포인트를 이용하되, 캐릭터명은 존재 여부와
     * 무관하게 넣고(플레이스홀더), 응답이 "OPENAPI00005(유효하지 않은 API KEY)"인지만 확인한다.
     * 캐릭터가 없어서 나는 에러(OPENAPI00003 등)는 키 자체는 정상이라는 뜻이므로 통과시킨다.
     */
    public void validateApiKey(String requestApiKey) {
        String apiKey = resolveApiKey(requestApiKey);
        try {
            nexonRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/id")
                            .queryParam("character_name", "API_KEY_확인용")
                            .build())
                    .header(NEXON_AUTH_HEADER, apiKey)
                    .retrieve()
                    .toBodilessEntity();
            // 200이면 당연히 키는 유효함 (플레이스홀더 이름의 캐릭터가 실제로 존재하는 극히 드문 경우)
        } catch (RestClientResponseException e) {
            String errorCode = extractErrorCode(e);
            if (e.getStatusCode().value() == 401
                    || e.getStatusCode().value() == 403
                    || INVALID_KEY_ERROR_CODE.equals(errorCode)) {
                throw new InvalidApiKeyException("유효하지 않은 넥슨 API 키입니다.");
            }
            // 그 외(캐릭터를 찾을 수 없음 등)는 키 자체는 유효하다는 뜻이므로 정상 통과.
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
                    .header(NEXON_AUTH_HEADER, apiKey)
                    .retrieve()
                    .body(OcidResponse.class);

            if (response == null || response.ocid() == null) {
                throw new NexonApiException("캐릭터를 찾을 수 없습니다: " + characterName);
            }
            return response.ocid();
        } catch (RestClientResponseException e) {
            if (INVALID_KEY_ERROR_CODE.equals(extractErrorCode(e)) || e.getStatusCode().value() == 401) {
                throw new InvalidApiKeyException("유효하지 않은 넥슨 API 키입니다.");
            }
            throw new NexonApiException("넥슨 API 조회 실패 (ocid): " + e.getStatusCode(), e);
        }
    }

    public CharacterBasicDto getBasicInfo(String ocid, String requestApiKey) {
        return getBasicInfo(ocid, requestApiKey, null);
    }

    /**
     * 날짜를 지정해서 그 날짜 기준 캐릭터 정보를 조회한다 (date=null이면 최신 정보).
     * 넥슨 API는 "레벨업 이력"을 한 번에 주는 전용 엔드포인트가 없어서,
     * 레벨 히스토리 기능은 이 메서드를 날짜별로 반복 호출해서 직접 만들어야 한다.
     */
    public CharacterBasicDto getBasicInfo(String ocid, String requestApiKey, LocalDate date) {
        String apiKey = resolveApiKey(requestApiKey);
        try {
            return nexonRestClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/character/basic").queryParam("ocid", ocid);
                        if (date != null) {
                            uriBuilder.queryParam("date", date.toString());
                        }
                        return uriBuilder.build();
                    })
                    .header(NEXON_AUTH_HEADER, apiKey)
                    .retrieve()
                    .body(CharacterBasicDto.class);
        } catch (RestClientResponseException e) {
            if (INVALID_KEY_ERROR_CODE.equals(extractErrorCode(e)) || e.getStatusCode().value() == 401) {
                throw new InvalidApiKeyException("유효하지 않은 넥슨 API 키입니다.");
            }
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
                    .header(NEXON_AUTH_HEADER, apiKey)
                    .retrieve()
                    .body(CharacterPopularityDto.class);
        } catch (RestClientResponseException e) {
            if (INVALID_KEY_ERROR_CODE.equals(extractErrorCode(e)) || e.getStatusCode().value() == 401) {
                throw new InvalidApiKeyException("유효하지 않은 넥슨 API 키입니다.");
            }
            throw new NexonApiException("넥슨 API 조회 실패 (popularity): " + e.getStatusCode(), e);
        }
    }

    /**
     * 최근 days일간의 레벨/경험치 진행률을 하루씩 조회해서 표로 만들고,
     * 레벨이 오른 날짜들을 뽑아낸다.
     *
     * 주의: 넥슨 API는 "오늘" 데이터가 아직 집계되지 않았을 수 있어 어제(D-1)부터 조회한다.
     * 캐릭터 생성일 이전 날짜는 데이터가 없어 조회 실패하는데, 그런 날짜는 결과에서 건너뛴다.
     * days가 클수록 넥슨 API를 그만큼 여러 번 순차 호출하므로 응답이 느려질 수 있다.
     */
    public LevelHistoryResponse getLevelHistory(String characterName, String requestApiKey, int days) {
        String ocid = getOcid(characterName, requestApiKey);

        List<LevelHistoryEntry> daily = new ArrayList<>();
        LocalDate cursor = LocalDate.now().minusDays(days);
        LocalDate yesterday = LocalDate.now().minusDays(1);

        while (!cursor.isAfter(yesterday)) {
            try {
                CharacterBasicDto basic = getBasicInfo(ocid, requestApiKey, cursor);
                if (basic != null && basic.characterLevel() != null) {
                    daily.add(new LevelHistoryEntry(cursor.toString(), basic.characterLevel(), basic.characterExpRate()));
                }
            } catch (NexonApiException ignored) {
                // 캐릭터 생성 이전 날짜 등, 데이터가 없는 날짜는 건너뛴다.
            }
            cursor = cursor.plusDays(1);
        }

        List<LevelUpEvent> levelUps = new ArrayList<>();
        for (int i = 1; i < daily.size(); i++) {
            Integer prevLevel = daily.get(i - 1).level();
            Integer currLevel = daily.get(i).level();
            if (prevLevel != null && currLevel != null && !currLevel.equals(prevLevel)) {
                levelUps.add(new LevelUpEvent(daily.get(i).date(), prevLevel, currLevel));
            }
        }

        return new LevelHistoryResponse(characterName, days, levelUps);
    }
}
