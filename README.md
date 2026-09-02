# My Maplestory

넥슨 메이플스토리 오픈 API를 기반으로 내 캐릭터의 성장 기록을 관리하는 개인 프로젝트입니다.
화면 전체가 "책"으로 되어 있고, 실제 종이책처럼 페이지를 넘기며 보스/장비/레벨/유니온/이벤트/스케줄러
정보를 확인할 수 있습니다.

- **배포 주소**: http://3.39.17.151 (AWS EC2, 넥슨 오픈 API 키 발급 후 바로 이용 가능)
- **개발 기간**: 2026.07 ~ (진행 중, 1인 개발)
- **개발 방식**: [Claude Code](https://claude.com/claude-code)(Anthropic의 AI 코딩 에이전트)와의
  페어 프로그래밍으로 기획-구현-배포 전 과정을 진행 — 아래 [AI 협업 방식](#ai-협업-방식-claude-code) 참고

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazonaws&logoColor=white)

---

## 핵심 컨셉 — 로그인/회원가입 없음

넥슨 오픈 API는 OAuth 로그인이 아니라 **공개 게임 데이터 조회용 API**입니다. 그래서 이 서비스도
별도의 계정 시스템 없이, 사용자가 본인의 **넥슨 오픈 API 키**를 직접 입력하는 방식으로 동작합니다.

1. 사용자가 openapi.nexon.com에서 발급받은 API 키를 입력 (앱 안에 단계별 발급 가이드 내장)
2. 프론트가 `POST /api/auth/validate-key`로 키 유효성부터 확인
3. 통과하면 책장이 넘어가며 캐릭터 선택 → 캐릭터 카드 화면으로 전환
4. 이후 모든 조회 요청에는 `x-nxopen-api-key` 헤더로 이 키가 자동으로 실림
5. **키는 브라우저(localStorage)에만 저장** — 서버 DB에는 절대 저장하지 않음

## 주요 기능

| 카테고리 | 내용 |
|---|---|
| **캐릭터 카드** | 프로필(레벨/직업/인기도/길드/함께한 기간), 카드 이미지 JPG 다운로드, 우측 상단 캐릭터 빠른 전환 위젯 |
| **오늘의 할 일** | 일일 콘텐츠 미완료 개수·주간 보스 미처치 마리 수를 캐릭터 카드 옆(왼쪽 페이지)에서 바로 알려주는 리마인더 |
| **보스** | 일일/주간 보스 선택 + 인원수별 결정석 가격 자동 계산, 주간 처치 현황(넥슨 공식 기록 + 직접 체크한 개별 목록) |
| **장비** | 인게임 장비창과 동일한 배치의 장비 그리드, 슬롯 클릭 시 스텟/잠재능력/에디셔널 잠재능력 표시, 프리셋 1/2/3 전환 |
| **캐시 아이템(코디)** | 캐릭터 미리보기 + 프리셋별 장착 캐시 아이템 목록 |
| **레벨** | 레벨업 히스토리, 경험치% 변화 차트, 일자별 증가량 |
| **유니온** | 유니온 레벨/등급, 공격대원 효과, 아티팩트 크리스탈, 유니온 챔피언 카드 |
| **이벤트** | 진행 중인 넥슨 공식 이벤트 목록 |
| **스케줄러** | 넥슨 스케줄러 API 연동 일일/주간 콘텐츠 진행 현황, 완료 항목 스킵 처리 |
| **다크모드** | 전체 화면 라이트/다크 테마 전환 |

보스 선택, 스킵 체크, 주간 보스 완료 체크는 넥슨 API가 제공하지 않는 개인화 정보라 자체 MySQL
DB(`boss_selections`, `skip_records`, `boss_clear_records`)에 캐릭터별로 저장합니다.

## 기술 스택

**Frontend**
- React 18 + Vite, React Router
- [react-pageflip](https://github.com/Nodlik/react-pageflip) — 실제 책장 넘기는 페이지 전환 구현
- Recharts — 레벨/경험치 차트
- Axios (API 키 자동 첨부 인터셉터)
- html-to-image — 캐릭터 카드 JPG 저장

**Backend**
- Spring Boot 3.3.2 (Java 17), Spring Data JPA, Spring Validation
- MySQL 8
- 넥슨 오픈 API(openapi.nexon.com) 연동 — 캐릭터 정보/장비/캐시아이템/유니온/스케줄러/공지 등 10여 개 엔드포인트

**인프라 / 배포**
- AWS EC2 (Ubuntu 24.04, 서울 리전) + Elastic IP
- Docker + Docker Compose (mysql / backend / frontend 3-container 구성)
- Nginx — 프론트 정적 파일 서빙 + `/api` 요청을 backend 컨테이너로 리버스 프록시 (같은 origin이라 CORS 이슈 없음)

## 시스템 구조

```
브라우저
  │  (넥슨 API 키는 localStorage에만 저장, 요청마다 x-nxopen-api-key 헤더로 전달)
  ▼
Nginx (frontend 컨테이너, :80)
  ├─ 정적 파일(React 빌드 산출물) 서빙
  └─ /api/**  ──▶  Spring Boot (backend 컨테이너, :8080)
                     ├─ 넥슨 오픈 API 프록시/가공
                     └─ MySQL (mysql 컨테이너, :3306) — 보스 선택/스킵/완료 체크 저장
```

## AI 협업 방식 (Claude Code)

이 프로젝트는 기능 구현부터 배포·운영까지 [Claude Code](https://claude.com/claude-code)를
페어 프로그래머 겸 운영 담당으로 활용해 진행했습니다.

- **기능 구현**: 요구사항을 대화로 전달하면 프론트/백엔드 코드를 함께 작성 — 예) 캐릭터 카드의
  "오늘의 할 일" 리마인더를 오른쪽 카드에서 왼쪽 페이지로 재배치, 보스 목록 페이지네이션 개수 조정,
  캐시 아이템 화면을 인게임 UI 참고 이미지에 맞춰 왼쪽(캐릭터 미리보기)/오른쪽(목록) 구조로 재설계
- **레이아웃/UX 개선**: 스크린샷을 보고 배경 이미지와 겹치는 버튼 위치 조정, 가이드 모달 레이아웃을
  2열 그리드로 재구성해 세로 스크롤 단축
- **기능 정리**: 사용성이 낮다고 판단된 "능력치" 카테고리를 프론트엔드·백엔드(엔드포인트/DTO/서비스
  로직) 전 영역에서 안전하게 제거
- **인프라 구축**: SSH 키(.ppk → OpenSSH .pem) 변환 안내부터, EC2에 Docker/Docker Compose 설치,
  `git pull` → `docker compose up -d --build` 재배포까지 전 과정을 직접 수행
- **버그 진단**: "페이지 넘김 애니메이션이 안 보인다"는 리포트를 받고 `react-pageflip` 라이브러리
  소스 코드를 직접 분석해, 과거에 "엉뚱한 페이지로 건너뛰는" 버그 때문에 애니메이션을 의도적으로
  꺼둔 상태였다는 이력을 확인. 애니메이션 복구를 두 가지 방식으로 직접 시도·프로덕션 빌드로
  재현 테스트까지 해본 뒤, 실제로 동일한 버그가 재현되는 것을 확인하고 안정성을 우선해 되돌리는
  판단까지 수행 — 기능 추가뿐 아니라 "무엇을 하지 않을지"까지 근거를 갖고 결정
- **배포 검증**: 매 배포 후 실제 브라우저로 접속해 화면 렌더링·콘솔 에러·API 동작을 직접 확인

## 프로젝트 구조

```
mymaplestory/
├── docker-compose.yml          # mysql + backend + frontend
├── backend/
│   └── src/main/java/com/mymaplestory/api/
│       ├── controller/         # ApiKeyController, CharacterController, NoticeController, UserPreferenceController
│       ├── service/            # NexonApiService(넥슨 API 연동), CharacterService, UserPreferenceService
│       ├── dto/                # 파싱용(Nexon*, snake_case) / 응답용(camelCase) DTO 분리
│       ├── entity/              # BossSelectionEntity, SkipRecordEntity, BossClearRecordEntity
│       ├── repository/         # Spring Data JPA
│       ├── config/             # CORS, Security, 넥슨 API RestClient 설정
│       └── exception/          # 전역 예외 처리
└── frontend/
    └── src/
        ├── pages/home/
        │   ├── apikey/         # API 키 입력 + 발급 가이드
        │   ├── character/      # 캐릭터 선택/카드/빠른 전환/오늘의 할 일
        │   ├── boss/           # 보스 선택/처치 현황
        │   ├── equipment/      # 장비, 캐시 아이템(코디)
        │   ├── level/          # 레벨/경험치 차트
        │   ├── union/          # 유니온 공격대/아티팩트/챔피언
        │   └── scheduler/      # 일일/주간 콘텐츠
        ├── components/book/    # BookFlipStage.jsx — react-pageflip 래퍼
        ├── context/            # BossSelectionContext (보스 선택 상태 전역 관리)
        ├── hooks/              # 카테고리별 API 조회 훅
        ├── api/client.js       # axios + API 키 자동 첨부 인터셉터
        └── css/                # 기능별로 분리된 스타일시트
```

## 로컬 개발 환경 실행

### 1. 사전 준비
- JDK 17+, Node.js 18+
- MySQL 8 (로컬 또는 Docker)
- 넥슨 오픈 API 키 (https://openapi.nexon.com)

### 2. 백엔드

```bash
CREATE DATABASE mymaplestory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
cd backend
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
./mvnw spring-boot:run
```

- 기본 포트: `http://localhost:8080`

### 3. 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

- 기본 포트: `http://localhost:5173`, `/api` 요청은 `vite.config.js`의 프록시로 백엔드에 자동 전달됩니다.

### 4. Docker Compose로 한 번에 실행 (배포와 동일한 구성)

```bash
cp .env.example .env   # MYSQL_ROOT_PASSWORD / DB_USERNAME / DB_PASSWORD / NEXON_API_KEY 채우기
docker compose up -d --build
```

- `http://localhost` 접속

## 디자인

책 페이지 배경 이미지 위에 실제 UI를 얹는 "모험 일지" 컨셉입니다. 라이트/다크 테마별 이미지를 모두
준비했고, 배지류(스타포스 표시, 잠재능력 등급 색 등)는 메이플스토리 인게임 관례를 그대로 따랐습니다.

| 이름 | 라이트 | 다크 |
|---|---|---|
| 배경 | `#F8F4EC` | `#211714` |
| 종이 | `#FEF9F1` | `#2F2420` |
| 잉크(글씨) | `#4E342E` | `#F5ECDF` |
| 포인트(코랄) | `#E76F51` | `#EF8368` |
| 보조(금색) | `#D4A017` | `#E3B840` |

폰트는 Maplestory체를 사용합니다.
