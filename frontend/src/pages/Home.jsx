import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApiKey } from '../ApiKeyContext.jsx'
import { validateApiKey } from '../api/client.js'
import { useBookFlip, PAGE_ORDER } from '../hooks/useBookFlip.js'
import { useAccountCharacters } from '../hooks/useAccountCharacters.js'
import { useCharacterCardData } from '../hooks/useCharacterCardData.js'
import { useLevelHistory } from '../hooks/useLevelHistory.js'
import { useCharacterStat } from '../hooks/useCharacterStat.js'
import { useNotices } from '../hooks/useNotices.js'
import { useScheduler } from '../hooks/useScheduler.js'
import { useEquipment } from '../hooks/useEquipment.js'
import { useCashItemEquipment } from '../hooks/useCashItemEquipment.js'
import { useUnion } from '../hooks/useUnion.js'
import { BossSelectionProvider } from '../context/BossSelectionContext.jsx'
import BookFlipStage from '../components/book/BookFlipStage.jsx'
import StartPage from './home/StartPage.jsx'
import ApiKeyPage from './home/apikey/ApiKeyPage.jsx'
import ApiKeyLeftPage from './home/apikey/ApiKeyLeftPage.jsx'
import LevelChartLeftPage from './home/level/LevelChartLeftPage.jsx'
import CharacterSelectPage, { CharacterWorldDetailPage } from './home/character/CharacterSelectPage.jsx'
import CharacterCardPage from './home/character/CharacterCardPage.jsx'
import CharacterCardLeftPage from './home/character/CharacterCardLeftPage.jsx'
import ArchivePage from './home/ArchivePage.jsx'
import CategorySelector from './home/CategorySelector.jsx'
import SchedulerDetailPage from './home/scheduler/SchedulerDetailPage.jsx'
import BossDetailPage, { BossSelectionPage } from './home/boss/BossDetailPage.jsx'
import BossOverviewLeftPage from './home/boss/BossOverviewLeftPage.jsx'
import QuickSwitchWidget from './home/character/QuickSwitchWidget.jsx'
import EquipmentDetailPanel, { EquipmentSelectionPage } from './home/equipment/EquipmentPage.jsx'
import CashItemPanel, { CashItemSelectionPage } from './home/equipment/CashItemPage.jsx'
import UnionDetailPage from './home/union/UnionPage.jsx'
import UnionInfoPage from './home/union/UnionInfoPage.jsx'
import UnionRaiderStateLeftPage from './home/union/UnionRaiderStateLeftPage.jsx'
import UnionArtifactEffectsLeftPage from './home/union/UnionArtifactEffectsLeftPage.jsx'
import UnionChampionCardsLeftPage from './home/union/UnionChampionCardsLeftPage.jsx'
import NoticeTicker from './home/NoticeTicker.jsx'
import '../css/notice-ticker.css'

const CATEGORIES = [
  { key: 'boss', label: '보스' },
  { key: 'loot', label: '장비' },
  { key: 'level', label: '레벨' },
  { key: 'stat', label: '능력치' },
  { key: 'union', label: '유니온' },
  { key: 'event', label: '이벤트' },
  // 공지사항은 카테고리로 따로 안 두고, 아카이브 페이지 하단에 항상 떠 있는
  // 티커 바(NoticeTicker)로 옮겼다 - 카테고리로도 있으면 중복이라 삭제함.
  // 넥슨 오픈 API의 "스케줄러 정보 조회" 연동 (https://openapi.nexon.com/ko/game/maplestory/?id=57).
  // 요청받은 4개 필드(daily_contents, boss_contents, weekly_boss_clear_count,
  // weekly_boss_clear_limit_count)만 사용한다. 경로(/character/scheduler)는
  // 다른 character/* 엔드포인트 명명 규칙을 따른 추정이라 다를 수 있음 - ArchivePage 참고.
  { key: 'scheduler', label: '스케줄러' },
]

/**
 * 전체 흐름을 "책 페이지를 넘기는" 하나의 동작으로 통일한다.
 * 페이지 순서: start(표지) -> apikey(키 입력) -> select(캐릭터 선택) -> card(캐릭터 카드) -> archive-*(카테고리별 아카이브)
 * 예전엔 카테고리(보스/장비/레벨/유니온/이벤트/스케줄러)를 하나의 'archive' 페이지 안에서
 * active 상태로만 전환했는데(페이지 넘김 애니메이션 없이 내용만 바뀜), 카테고리를 바꿀 때도
 * 진짜 책장이 넘어가는 느낌을 원해서 카테고리마다 실제 페이지(archive-boss, archive-loot 등)로
 * 분리했다. CategorySelector를 누르면 이제 flipTo('archive-' + key)로 실제 전환된다.
 * 실제 애니메이션/레이아웃은 각 하위 컴포넌트(components/book, pages/home/*)로 분리되어 있고,
 * 이 파일은 그 조각들을 연결하는 오케스트레이션만 담당한다.
 */
export default function Home() {
  const location = useLocation()
  const {
    apiKey,
    isKeySet,
    selectedCharacter,
    hasSelectedCharacter,
    setApiKey,
    selectCharacter,
    clearSelectedCharacter,
    clearApiKey,
  } = useApiKey()

  // 매번 실행할 때는 항상 표지(시작하기)부터 시작한다. 키/캐릭터가 로컬에 저장돼
  // 있어도 재사용하지 않고 이 화면부터 다시 거치게 한다 (원래는 재방문 시 건너뛰게
  // 했었는데, 항상 시작 화면부터 보여달라는 요청으로 변경).
  const initialPage = 'start'
  const { page, flipBookRef, flipTo, jumpTo, handleFlip, startFlipIndex } = useBookFlip(initialPage)

  const [checking, setChecking] = useState(false)
  const [keyError, setKeyError] = useState(null)

  // 캐릭터 선택 - 어느 서버(월드)를 골랐는지. select-detail 페이지가 이 값으로
  // 그 서버의 캐릭터만 걸러서 보여준다.
  const [selectedWorld, setSelectedWorld] = useState(null)

  const { characters: accountCharacters, loading: accountCharactersLoading, error: accountCharactersError } =
    useAccountCharacters(isKeySet && (page === 'select' || page === 'select-detail'), apiKey)

  const { cardData, cardLoading, cardError } = useCharacterCardData(
    // "항상 표지부터 시작" 하도록 바꾼 뒤로, 화면은 표지에 있는데도 브라우저에
    // 저장된 예전 selectedCharacter 값 때문에 백그라운드에서 몰래 카드 조회가
    // 나가서(그 시점엔 키가 없어 API_KEY_REQUIRED로 실패) 버그가 있었다.
    // 실제로 카드/아카이브 화면을 보고 있을 때만 조회하도록 조건을 추가했다.
    hasSelectedCharacter && (page === 'card' || page.startsWith('archive-') || page.startsWith('loot-')),
    selectedCharacter
  )
  const { levelHistory, loading: levelHistoryLoading, error: levelHistoryError } = useLevelHistory(
    page === 'archive-level' && hasSelectedCharacter,
    selectedCharacter
  )
  const { characterStat, loading: characterStatLoading, error: characterStatError } = useCharacterStat(
    page === 'archive-stat' && hasSelectedCharacter,
    selectedCharacter
  )
  // 이벤트: "이벤트" 카테고리를 선택했을 때만 조회
  const { notices: eventNotices, loading: eventNoticesLoading, error: eventNoticesError } = useNotices(
    page === 'archive-event',
    'event'
  )
  // 공지사항: 카테고리 선택과 무관하게, 아카이브 계열 페이지에 들어오면 항상 하단 티커용으로 조회
  const { notices: footerNotices, loading: footerNoticesLoading, error: footerNoticesError } = useNotices(
    page.startsWith('archive-'),
    'notice'
  )
  const { scheduler, loading: schedulerLoading, error: schedulerError } = useScheduler(
    // "스케줄러"/"보스" 카테고리와 그 상세 페이지들은 전부 같은 API(scheduler
    // 응답)를 재사용한다. 카드 페이지도 포함하는 이유: TodoReminderBanner가
    // "오늘 아직 안 한 일일 콘텐츠/이번 주 안 잡은 보스"를 캐릭터 카드에서
    // 바로 보여주려면 이 데이터가 필요하다.
    (page === 'card' || page === 'archive-scheduler' || page === 'archive-boss' || page.startsWith('scheduler-') || page.startsWith('boss-')) &&
      hasSelectedCharacter,
    selectedCharacter
  )
  // 장비: "장비 확인" 버튼으로 들어온 상세 페이지에서만 조회 (개요 페이지는
  // 버튼 2개뿐이라 장비 데이터가 필요 없다).
  const { equipment, loading: equipmentLoading, error: equipmentError } = useEquipment(
    page === 'loot-equipment' && hasSelectedCharacter,
    selectedCharacter
  )
  // 캐시: "코디 확인" 버튼으로 들어온 상세 페이지에서만 조회 (item-equipment와 별도 엔드포인트).
  const { cashItem, loading: cashItemLoading, error: cashItemError } = useCashItemEquipment(
    page === 'loot-cash' && hasSelectedCharacter,
    selectedCharacter
  )
  // 유니온: "유니온" 카테고리 개요 + 4개 상세 페이지 전부에서 필요해서 조건에 같이 포함한다.
  const {
    union,
    raider: unionRaider,
    artifact: unionArtifact,
    champion: unionChampion,
    loading: unionLoading,
    error: unionError,
  } = useUnion(
    (page === 'archive-union' || page.startsWith('union-')) && hasSelectedCharacter,
    selectedCharacter
  )
  // 보스 선택(난이도/인원수) 상태는 이제 Home.jsx가 직접 들고 있지 않고
  // BossSelectionProvider(Context)가 대신 들고 있는다. react-pageflip은 모든
  // 페이지를 항상 DOM에 갖고 있어서(book-flip 구조), 예전처럼 Home.jsx가 이
  // 상태를 직접 들고 있으면 체크박스 하나 누를 때마다 Home.jsx 전체가 다시
  // 렌더링되고, 그 여파로 책 전체(모든 페이지)가 다시 그려지면서 스크롤
  // 위치가 맨 위로 튀는 문제가 있었다. 아래 return문에서 책 전체를
  // <BossSelectionProvider>로 감싸는 것으로 대체했다.

  // 장비 - 왼쪽(선택 그리드)과 오른쪽(상세 패널) 페이지가 서로 다른 컴포넌트라서
  // 상태를 여기(Home.jsx)에서 들고 있어야 양쪽이 같은 선택을 보게 된다.
  const [selectedEquipmentPreset, setSelectedEquipmentPreset] = useState(null)
  const [selectedEquipmentSlot, setSelectedEquipmentSlot] = useState(null)

  // 캐시 - 코디 프리셋 버튼만 있고 상세 패널이 따로 없어서(단일 페이지), 프리셋
  // 선택 상태만 들고 있으면 된다.
  const [selectedCashPreset, setSelectedCashPreset] = useState(null)

  // MenuButton의 "홈으로" 클릭을 처리한다. 이미 "/" 위에 있을 때는 라우트가
  // 안 바뀌어서 아무 반응이 없었던 버그 수정 - state로 전달된 타임스탬프를 감지해서
  // 화면을 강제로 되돌린다. API 키까지 지우진 않고, 캐릭터 선택 단계로 되돌아간다.
  useEffect(() => {
    if (!location.state?.resetAt) return
    clearSelectedCharacter()
    jumpTo(isKeySet ? 'select' : 'start')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const handleStart = () => flipTo('apikey')

  const handleSubmitKey = async (inputValue) => {
    setChecking(true)
    setKeyError(null)
    try {
      await validateApiKey(inputValue.trim())
      setApiKey(inputValue)
      flipTo('select')
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        setKeyError('유효하지 않은 API 키입니다. 다시 확인해주세요.')
      } else if (status === 400) {
        setKeyError('API 키를 입력해주세요.')
      } else {
        setKeyError('키 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setChecking(false)
    }
  }

  // 서버 버튼을 누르면 진짜 책 페이지로 넘어가서 그 서버의 캐릭터 목록(레벨순)을 보여준다.
  const handleSelectWorld = (worldName) => {
    setSelectedWorld(worldName)
    flipTo('select-detail')
  }

  // CharacterSelectPage가 목록에서 고른 캐릭터 객체(ocid/characterName/worldName/...)를
  // 그대로 넘겨준다 - 우리는 이름만 selectedCharacter로 저장해두면 나머지 조회
  // (카드/스케줄러/보스 등)는 전부 그 이름 기준으로 알아서 이루어진다.
  const handleSelectCharacter = (character) => {
    selectCharacter(character.characterName)
    flipTo('card')
  }

  const handleReset = () => {
    clearApiKey()
    jumpTo('start')
  }

  // "다른 캐릭터 선택" - 카드 페이지에서 선택 페이지로 되돌아간다.
  const handleBackToSelect = () => {
    clearSelectedCharacter()
    jumpTo('select')
  }

  // 우측 상단 "캐릭터 전환" 위젯(QuickSwitchWidget) - 서버/캐릭터 선택 단계를
  // 다시 거치지 않고 바로 다른 캐릭터의 카드로 점프한다. handleSelectCharacter와
  // 달리 world 상태를 안 건드리고(어차피 select 페이지를 안 거치니까 필요
  // 없음), 애니메이션 없이 즉시 이동한다(jumpTo) - "빠른 전환"이라는 의도에
  // 맞게, 다른 캐릭터로 바뀌는데 표지->API키 같은 넘김 연출이 끼면 오히려
  // 더 느리게 느껴진다.
  const handleQuickSwitch = (character) => {
    selectCharacter(character.characterName)
    jumpTo('card')
  }

  // 카테고리 버튼(보스/장비/레벨/유니온/이벤트/스케줄러)을 누르면 실제 책 페이지로 넘어간다.
  const handleSelectCategory = (key) => flipTo(`archive-${key}`)

  // 보스 개요(아카이브 안)에서 일일/주간 버튼을 누르면, 진짜 책 페이지로
  // 실제 책장 넘김이 일어난다. 예전엔 주간 보스가 지역(메이플월드/아케인/
  // 그란디스)별 페이지로 한 번 더 나뉘었는데, 지금은 지역 구분 없이 하나의
  // 주간 보스 페이지로 합쳤다.
  const handleGoBossDetail = (cycle) => flipTo(`boss-${cycle}`)

  // 스케줄러 개요에서 일일/주간 버튼을 누르면 마찬가지로 진짜 책 페이지로 넘어간다.
  const handleGoSchedulerDetail = (cycle) => flipTo(`scheduler-${cycle}`)

  // 유니온 개요에서 정보/공격대/아티팩트/챔피언 버튼을 누르면 진짜 책 페이지로 넘어간다.
  const handleGoUnionDetail = (kind) => flipTo(`union-${kind}`)

  // 장비 개요에서 "장비 확인"/"코디 확인" 버튼을 누르면 진짜 책 페이지로 넘어간다.
  // 예전엔 "캐시"가 왼쪽 카테고리 목록에 독립된 항목으로 있었는데, 카테고리
  // 목록이 너무 길어져서 "장비" 하위로 옮기고 이 두 버튼으로 갈라지게 바꿨다.
  const handleGoLootDetail = (kind) => flipTo(`loot-${kind}`)

  function renderPageContent(p) {
    if (p === 'start') return <StartPage onStart={handleStart} disabled={false} />
    if (p === 'apikey') {
      return (
        <ApiKeyPage
          onSubmit={handleSubmitKey}
          checking={checking}
          disabled={false}
          error={keyError}
        />
      )
    }
    if (p === 'select') {
      return (
        <CharacterSelectPage
          characters={accountCharacters}
          loading={accountCharactersLoading}
          error={accountCharactersError}
          onSelectWorld={handleSelectWorld}
        />
      )
    }
    if (p === 'select-detail') {
      return (
        <CharacterWorldDetailPage
          characters={accountCharacters}
          worldName={selectedWorld}
          onSelectCharacter={handleSelectCharacter}
          onBack={() => flipTo('select')}
        />
      )
    }
    if (p === 'card') {
      return (
        <CharacterCardPage
          cardData={cardData}
          loading={cardLoading}
          error={cardError}
          onGoArchive={() => flipTo('archive-boss')}
          onBackToSelect={handleBackToSelect}
          onReset={handleReset}
        />
      )
    }
    if (p.startsWith('archive-')) {
      const category = p.replace('archive-', '')
      return (
        <ArchivePage
          categories={CATEGORIES}
          active={category}
          onSelectCategory={handleSelectCategory}
          onBack={() => flipTo('card')}
          levelHistory={levelHistory}
          levelHistoryLoading={levelHistoryLoading}
          levelHistoryError={levelHistoryError}
          characterStat={characterStat}
          characterStatLoading={characterStatLoading}
          characterStatError={characterStatError}
          eventNotices={eventNotices}
          eventNoticesLoading={eventNoticesLoading}
          eventNoticesError={eventNoticesError}
          scheduler={scheduler}
          schedulerLoading={schedulerLoading}
          schedulerError={schedulerError}
          onGoSchedulerDetail={handleGoSchedulerDetail}
          onGoBossDetail={handleGoBossDetail}
          onGoLootDetail={handleGoLootDetail}
          union={union}
          unionRaider={unionRaider}
          unionArtifact={unionArtifact}
          unionChampion={unionChampion}
          unionLoading={unionLoading}
          unionError={unionError}
          onGoUnionDetail={handleGoUnionDetail}
        />
      )
    }
    if (p === 'scheduler-daily' || p === 'scheduler-weekly') {
      const cycle = p.replace('scheduler-', '')
      return (
        <SchedulerDetailPage
          cycle={cycle}
          scheduler={scheduler}
          characterName={selectedCharacter}
          onBack={() => flipTo('archive-scheduler')}
        />
      )
    }
    if (p === 'boss-daily') {
      return (
        <BossDetailPage
          pageKind="daily"
          scheduler={scheduler}
          onBack={() => flipTo('archive-boss')}
        />
      )
    }
    if (p === 'boss-weekly') {
      return (
        <BossDetailPage
          pageKind="weekly"
          scheduler={scheduler}
          onBack={() => flipTo('archive-boss')}
        />
      )
    }
    if (p === 'loot-equipment') {
      return (
        <EquipmentDetailPanel
          equipment={equipment}
          selectedPreset={selectedEquipmentPreset}
          selectedSlot={selectedEquipmentSlot}
          onBack={() => flipTo('archive-loot')}
        />
      )
    }
    if (p === 'loot-cash') {
      return (
        <CashItemPanel
          cashItem={cashItem}
          selectedPreset={selectedCashPreset}
          onBack={() => flipTo('archive-loot')}
        />
      )
    }
    if (p === 'union-raider' || p === 'union-artifact' || p === 'union-champion') {
      const kind = p.replace('union-', '')
      return (
        <UnionDetailPage
          pageKind={kind}
          unionRaider={unionRaider}
          unionArtifact={unionArtifact}
          unionChampion={unionChampion}
          onBack={() => flipTo('archive-union')}
        />
      )
    }
    return null
  }

  // boss-daily / boss-weekly의 짝(왼쪽) 페이지에는 보스 선택 목록을,
  // loot-equipment의 짝(왼쪽) 페이지에는 장비 그리드를 넣는다.
  function renderLeftPageContent(p) {
    if (p === 'apikey') {
      return <ApiKeyLeftPage />
    }
    if (p === 'card') {
      return (
        <CharacterCardLeftPage
          characterName={selectedCharacter}
          scheduler={scheduler}
          onGoDaily={() => flipTo('scheduler-daily')}
          onGoBossWeekly={() => flipTo('boss-weekly')}
        />
      )
    }
    if (p === 'archive-level') {
      return (
        <LevelChartLeftPage
          levelHistory={levelHistory}
          levelHistoryLoading={levelHistoryLoading}
          levelHistoryError={levelHistoryError}
        />
      )
    }
    if (p === 'archive-boss') {
      return <BossOverviewLeftPage scheduler={scheduler} characterName={selectedCharacter} />
    }
    if (p === 'boss-daily') {
      return <BossSelectionPage pageKind="daily" scheduler={scheduler} />
    }
    if (p === 'boss-weekly') {
      return <BossSelectionPage pageKind="weekly" scheduler={scheduler} characterName={selectedCharacter} />
    }
    if (p === 'loot-equipment') {
      return (
        <EquipmentSelectionPage
          equipment={equipment}
          characterImage={cardData?.characterImage}
          selectedPreset={selectedEquipmentPreset}
          onSelectPreset={setSelectedEquipmentPreset}
          selectedSlot={selectedEquipmentSlot}
          onSelectSlot={setSelectedEquipmentSlot}
        />
      )
    }
    if (p === 'loot-cash') {
      return (
        <CashItemSelectionPage
          cashItem={cashItem}
          characterImage={cardData?.characterImage}
          selectedPreset={selectedCashPreset}
          onSelectPreset={setSelectedCashPreset}
        />
      )
    }
    if (p === 'archive-union') {
      return <UnionInfoPage union={union} loading={unionLoading} error={unionError} />
    }
    if (p === 'union-raider') {
      return <UnionRaiderStateLeftPage unionRaider={unionRaider} />
    }
    if (p === 'union-artifact') {
      return <UnionArtifactEffectsLeftPage unionArtifact={unionArtifact} />
    }
    if (p === 'union-champion') {
      return <UnionChampionCardsLeftPage unionChampion={unionChampion} />
    }
    return null
  }

  return (
    <BossSelectionProvider characterName={selectedCharacter}>
      <section className="home">
        {/* 캐릭터가 하나라도 선택된 뒤로는(카드/아카이브 어디서든) 서버 선택부터
            다시 거치지 않고 바로 다른 캐릭터로 전환할 수 있게 우측 상단에
            고정 버튼을 띄운다. */}
        {hasSelectedCharacter && (
          <QuickSwitchWidget
            apiKey={apiKey}
            currentCharacterName={selectedCharacter}
            onSwitch={handleQuickSwitch}
          />
        )}

        {/* 책 바로 위 - 아카이브 계열 페이지를 보고 있을 때만 뜨는 공지사항 티커.
            책 안에 두면 다른 콘텐츠(북마크, 스케줄러 목록 등)와 겹쳐 보이는
            문제가 있어서 밖으로 뺐고, 책과 같은 그룹으로 묶어서 화면 가운데
            위쪽에 위치하도록 했다. */}
        {page.startsWith('archive-') && (
          <div className="home__footer-ticker-outside">
            {footerNoticesLoading && <p className="home__select-hint">공지 불러오는 중...</p>}
            {footerNoticesError && <p className="home__apikey-error">{footerNoticesError}</p>}
            {!footerNoticesLoading && !footerNoticesError && footerNotices && (
              <NoticeTicker items={footerNotices} intervalMs={6000} />
            )}
          </div>
        )}

        <BookFlipStage
          pageKeys={PAGE_ORDER}
          flipBookRef={flipBookRef}
          startFlipIndex={startFlipIndex}
          onFlip={handleFlip}
          renderPageContent={renderPageContent}
          renderLeftPageContent={renderLeftPageContent}
          coverOnly={page === 'start'}
          overlay={
            page.startsWith('archive-') && (
              <CategorySelector
                categories={CATEGORIES}
                active={page.replace('archive-', '')}
                onSelectCategory={handleSelectCategory}
              />
            )
          }
        />
      </section>
    </BossSelectionProvider>
  )
}
