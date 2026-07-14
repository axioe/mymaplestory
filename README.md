# My Maplestory

넥슨 메이플스토리 오픈 API 기반, 내 캐릭터 정보와 성장 기록을 "책"처럼 넘겨보는 개인 프로젝트.

- Backend: Spring Boot 3 (Java 17)
- Frontend: React 18 + Vite + React Router
- 외부 API: 넥슨 메이플스토리 오픈 API (openapi.nexon.com)

## 핵심 컨셉 (중요 - 로그인/회원가입 없음)

이 서비스는 **자체 로그인/회원가입 기능이 없습니다.** 넥슨 오픈 API 자체가 로그인(OAuth)이 아니라
공개 게임 데이터 조회용 API이기 때문에, 대신 이렇게 동작합니다:

1. 사용자가 자신의 **넥슨 오픈 API 키**와 **대표 캐릭터 닉네임**을 입력
2. 프론트가 백엔드에 `POST /api/auth/validate-key`로 키 유효성부터 확인
3. 유효하면 책장이 넘어가는 애니메이션과 함께 **캐릭터 카드 화면**으로 전환되고,
   이후 모든 조회 요청에는 `X-Nexon-Api-Key` 헤더로 이 키가 자동으로 실려서 백엔드로 전달됨
4. 키/닉네임은 브라우저(`localStorage`)에만 저장됨 — 서버 DB에 저장하지 않음

---

## 1. 사전 준비

- JDK 17+
- Maven (또는 IntelliJ 내장 Maven)
- Node.js 18+
- 넥슨 오픈 API 키 (https://openapi.nexon.com 에서 발급)
- (선택) 로컬 MySQL — 현재 코드는 JPA 엔티티가 없어서 DB 연결 없이도 백엔드가 동작합니다.
  `application.yml`의 datasource 설정은 추후 히스토리 저장 기능을 붙일 때를 대비해 남겨뒀습니다.
  당장 DB를 안 붙이고 싶다면 `backend/src/main/resources/application.yml`에서 `spring.datasource`,
  `spring.jpa` 블록과 `pom.xml`의 `spring-boot-starter-data-jpa` / `mysql-connector-j`를 지워도 됩니다.

## 2. 백엔드 실행

### 2-1. (DB를 계속 쓸 경우) MySQL 준비

```sql
CREATE DATABASE mymaplestory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2-2. 환경변수 설정

```bash
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
# NEXON_API_KEY는 "서버 기본 키"(로컬 개발 편의용) - 없어도 됨.
# 실제 서비스에서는 프론트가 보내는 X-Nexon-Api-Key 헤더를 우선 사용합니다.
export NEXON_API_KEY=
```

### 2-3. 실행

```bash
cd backend
./mvnw spring-boot:run
# 또는 IntelliJ에서 MyMaplestoryApplication 실행
```

- 기본 포트: `http://localhost:8080`
- API 문서(Swagger UI): `http://localhost:8080/swagger-ui.html`

### 2-4. 엔드포인트

| Method | Path                              | 헤더                        | 설명                          |
|--------|-----------------------------------|-----------------------------|-------------------------------|
| POST   | `/api/auth/validate-key`          | `X-Nexon-Api-Key` (필수)    | 키 유효성 확인. 성공 시 `{"valid":true}`, 실패 시 401 |
| GET    | `/api/characters/{name}/card`     | `X-Nexon-Api-Key` (필수)    | 캐릭터 카드(닉네임/서버/레벨/직업/인기도/길드) |

두 엔드포인트 모두 `X-Nexon-Api-Key` 헤더가 없으면, 서버에 `NEXON_API_KEY` 환경변수가 설정된 경우에 한해 그 값으로 대체 시도합니다. 둘 다 없으면 400을 반환합니다.

동작 확인:
```bash
curl -X POST -H "X-Nexon-Api-Key: 실제키" http://localhost:8080/api/auth/validate-key
curl -H "X-Nexon-Api-Key: 실제키" http://localhost:8080/api/characters/캐릭터명/card
```

## 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

- 기본 포트: `http://localhost:5173`
- `vite.config.js`에 `/api` 프록시가 설정되어 있어 백엔드(8080)로 자동 전달됩니다.
- 메이플 폰트(`Maplestory Light.ttf`, `Maplestory Bold.ttf`)는 `src/assets/fonts/`에 이미 넣어두신 상태라 별도 설정 없이 바로 적용됩니다.

## 4. 화면 흐름

1. **첫 화면**: 열린 책 모양 위에 넥슨 API 키 + 대표 캐릭터 닉네임 입력
2. 확인 클릭 → `validate-key` 통과 시 책장이 오른쪽에서 왼쪽으로 천천히 넘어가는 애니메이션(1.8초)
3. **캐릭터 카드 화면**: 실제 `/api/characters/{name}/card` 응답으로 채워진 카드(이미지 중앙, 닉네임, 서버, 레벨, 직업, 인기도, 길드)
4. 화살표 클릭 → 책 + 카테고리(보스/전리품/레벨/스토리) 패널 화면 (카테고리별 히스토리는 아직 자리만 잡아둔 상태)

## 5. 프로젝트 구조

```
backend/
  src/main/java/com/mymaplestory/api/
    config/       CORS, Security, 넥슨 API RestClient 설정
    controller/   ApiKeyController(키 검증), CharacterController(캐릭터 카드)
    service/      NexonApiService(넥슨 API 연동), CharacterService
    dto/          요청/응답 객체
    exception/    전역 예외 처리 (키 없음/유효하지 않음/넥슨 API 오류)

frontend/
  src/
    pages/        Home(입력→플립→카드→아카이브 전체 흐름), CharacterCard(개별 캐릭터 검색용, 별도 라우트)
    components/   Book(책 SVG), CharacterSummaryCard(카드 UI), CategoryPanel, MapleLeafIcon 등
    api/          client.js (axios + API 키 자동 첨부 인터셉터)
    css/          global.css(색상 토큰/폰트), components.css(컴포넌트별 스타일)
    ApiKeyContext.jsx   API 키 + 캐릭터 닉네임 상태 관리 (로그인 대체)
    ThemeContext.jsx    다크모드 상태 관리
```

## 6. 색상 팔레트 ("모험 일지" 컨셉)

| 이름 | 값 | 변수 |
|---|---|---|
| 배경 | `#F8F4EC` | `--color-canvas` |
| 종이 | `#FEF9F1` | `--color-page` |
| 다크 브라운 | `#4E342E` | `--color-ink` / `--color-line` |
| 단풍 | `#E76F51` | `--color-accent` |
| 금색 | `#D4A017` | `--color-accent-2` |
| 브라운 | `#B85E3C` | `--color-accent-soft` |

`frontend/src/css/global.css`에 정의되어 있고, 대부분의 컴포넌트가 이 토큰을 참조하므로 여기서만 바꾸면 전체에 반영됩니다.

## 7. 남은 작업 제안

1. **길드명 필드 검증**: `CharacterBasicDto`의 `character_guild_name` 필드명은 넥슨 공식 문서로 재확인이 필요합니다(오프라인 환경에서 작성됨). 실제 키로 확인 후 필드명이 다르면 `CharacterBasicDto.java` / `NexonApiService`에서 맞춰주세요.
2. **아카이브 실데이터 연동**: 카테고리(보스/전리품/레벨/스토리)별 히스토리는 넥슨 API가 실시간 스냅샷만 제공하므로, 매일 배치로 캐릭터 정보를 저장하는 스케줄러 + 별도 엔티티/DB 설계가 필요합니다 (지금은 DB 연결을 뗀 상태라, 이 기능을 붙일 때 다시 MySQL 설정을 켜시면 됩니다).
3. **프로필 이미지 캡쳐 기능**: 프론트엔드에서 `html-to-image` 또는 `html2canvas` 라이브러리 검토.
4. **모바일 반응형 점검**: 기본 반응형만 고려된 상태라 실제 기기에서 레이아웃 확인 필요.
