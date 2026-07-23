import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApiKey } from '../ApiKeyContext.jsx'
import { validateApiKey, fetchCharacterCard } from '../api/client.js'
import { useBookFlip, PAGE_ORDER } from '../hooks/useBookFlip.js'
import { useCharacterCardData } from '../hooks/useCharacterCardData.js'
import { useLevelHistory } from '../hooks/useLevelHistory.js'
import BookFlipStage from '../components/book/BookFlipStage.jsx'
import StartPage from './home/StartPage.jsx'
import ApiKeyPage from './home/ApiKeyPage.jsx'
import CharacterSelectPage from './home/CharacterSelectPage.jsx'
import CharacterCardPage from './home/CharacterCardPage.jsx'
import ArchiveView from './home/ArchiveView.jsx'

const CATEGORIES = [
  { key: 'boss', label: '보스' },
  { key: 'loot', label: '전리품' },
  { key: 'level', label: '레벨' },
  { key: 'story', label: '스토리' },
]

/**
 * 전체 흐름을 "책 페이지를 넘기는" 하나의 동작으로 통일한다.
 * 페이지 순서: start(표지) -> apikey(키 입력) -> select(캐릭터 선택) -> card(캐릭터 카드)
 * 실제 애니메이션/레이아웃은 각 하위 컴포넌트(components/book, pages/home/*)로 분리되어 있고,
 * 이 파일은 그 조각들을 연결하는 오케스트레이션만 담당한다.
 * (아카이브 화면은 레이아웃이 완전히 달라서 이 플립 시스템 밖에서 별도로 전환한다.)
 */
export default function Home() {
  const location = useLocation()
  const {
    isKeySet,
    savedCharacters,
    selectedCharacter,
    hasSelectedCharacter,
    setApiKey,
    addCharacter,
    selectCharacter,
    clearSelectedCharacter,
    clearApiKey,
  } = useApiKey()

  // 이미 키/캐릭터가 저장되어 있다면(재방문) 표지부터 다시 보여줄 필요 없음
  const initialPage = isKeySet ? (hasSelectedCharacter ? 'card' : 'select') : 'start'
  const { page, flipBookRef, flipTo, jumpTo, handleFlip, startFlipIndex } = useBookFlip(initialPage)

  const [checking, setChecking] = useState(false)
  const [keyError, setKeyError] = useState(null)

  const [active, setActive] = useState('boss')
  const [archiveView, setArchiveView] = useState(false)

  const { cardData, setCardData, cardLoading, cardError } = useCharacterCardData(
    hasSelectedCharacter,
    selectedCharacter
  )
  const { levelHistory, loading: levelHistoryLoading, error: levelHistoryError } = useLevelHistory(
    archiveView && active === 'level' && hasSelectedCharacter,
    selectedCharacter
  )

  // MenuButton의 "홈으로" 클릭을 처리한다. 이미 "/" 위에 있을 때는 라우트가
  // 안 바뀌어서 아무 반응이 없었던 버그 수정 - state로 전달된 타임스탬프를 감지해서
  // 화면을 강제로 되돌린다. API 키까지 지우진 않고, 캐릭터 선택 단계로 되돌아간다.
  useEffect(() => {
    if (!location.state?.resetAt) return
    setArchiveView(false)
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

  const handleSelectCharacter = (name) => {
    selectCharacter(name)
    flipTo('card')
  }

  // 실패 시 예외를 던져서 CharacterSelectPage가 자체적으로 에러 문구를 보여주게 한다.
  const handleAddCharacter = async (name) => {
    const data = await fetchCharacterCard(name)
    addCharacter(name, data.worldName)
    setCardData(name, data) // 방금 조회한 데이터를 바로 캐시해서 카드 페이지에서 재조회 안 해도 되게
    flipTo('card')
  }

  const handleReset = () => {
    clearApiKey()
    jumpTo('start')
    setArchiveView(false)
  }

  // "다른 캐릭터 선택" - 카드 페이지에서 선택 페이지로 되돌아간다.
  const handleBackToSelect = () => {
    clearSelectedCharacter()
    jumpTo('select')
  }

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
          savedCharacters={savedCharacters}
          onSelectCharacter={handleSelectCharacter}
          onAddCharacter={handleAddCharacter}
        />
      )
    }
    if (p === 'card') {
      return (
        <CharacterCardPage
          cardData={cardData}
          loading={cardLoading}
          error={cardError}
          onGoArchive={() => setArchiveView(true)}
          onBackToSelect={handleBackToSelect}
          onReset={handleReset}
        />
      )
    }
    return null
  }

  if (archiveView) {
    return (
      <ArchiveView
        categories={CATEGORIES}
        active={active}
        onSelectCategory={setActive}
        onBack={() => setArchiveView(false)}
        levelHistory={levelHistory}
        levelHistoryLoading={levelHistoryLoading}
        levelHistoryError={levelHistoryError}
      />
    )
  }

  return (
    <BookFlipStage
      pageKeys={PAGE_ORDER}
      flipBookRef={flipBookRef}
      startFlipIndex={startFlipIndex}
      onFlip={handleFlip}
      renderPageContent={renderPageContent}
    />
  )
}
