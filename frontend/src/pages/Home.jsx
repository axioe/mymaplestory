import { useEffect, useState } from 'react'
import Book from '../components/Book.jsx'
import TickDivider from '../components/TickDivider.jsx'
import DateTimeLabel from '../components/DateTimeLabel.jsx'
import CategoryPanel from '../components/CategoryPanel.jsx'
import CharacterSummaryCard from '../components/CharacterSummaryCard.jsx'
import CharacterSelect from '../components/CharacterSelect.jsx'
import { useApiKey } from '../ApiKeyContext.jsx'
import { validateApiKey, fetchCharacterCard } from '../api/client.js'
import '../css/home.css'

const CATEGORIES = [
  { key: 'boss', label: '보스' },
  { key: 'loot', label: '전리품' },
  { key: 'level', label: '레벨' },
  { key: 'story', label: '스토리' },
]

const COVER_BOOK_MAX_WIDTH = 960
const COMPACT_BOOK_MAX_WIDTH = 620
const FLIP_DURATION_MS = 1800 // css .home__flip-front transition 시간과 반드시 맞출 것

/**
 * 이 서비스는 자체 로그인/회원가입을 제공하지 않는다. 2단계로 나뉜다.
 * 1단계: 넥슨 오픈 API 키만 먼저 입력 -> 검증 통과 시 페이지 넘김 애니메이션
 * 2단계: 등록해둔 캐릭터 중에서 고르거나 새로 추가 -> 선택한 캐릭터 카드 표시
 */
export default function Home() {
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

  const [inputValue, setInputValue] = useState('')
  const [active, setActive] = useState('boss')
  const [subPage, setSubPage] = useState('card') // 캐릭터 선택 이후 첫 페이지 = 카드
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)
  // 'cover' -> 'flipping'(페이지 넘어가는 중) -> 완료되면 isKeySet=true 로 다음 화면 렌더
  const [phase, setPhase] = useState('cover')

  // 캐릭터 카드 데이터 (백엔드 /api/characters/{name}/card 실제 연동)
  const [cardData, setCardData] = useState(null)
  const [cardLoading, setCardLoading] = useState(false)
  const [cardError, setCardError] = useState(null)

  useEffect(() => {
    if (!isKeySet || !hasSelectedCharacter || subPage !== 'card') return
    let cancelled = false
    setCardLoading(true)
    setCardError(null)
    fetchCharacterCard(selectedCharacter)
      .then((data) => {
        if (!cancelled) setCardData(data)
      })
      .catch(() => {
        if (!cancelled) setCardError('캐릭터 정보를 불러오지 못했습니다. 닉네임이나 API 키를 확인해주세요.')
      })
      .finally(() => {
        if (!cancelled) setCardLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isKeySet, hasSelectedCharacter, subPage, selectedCharacter])

  const handleSubmitKey = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || checking) return

    setChecking(true)
    setError(null)
    try {
      await validateApiKey(inputValue.trim())
      setPhase('flipping') // 검증 통과 -> 페이지 넘김 애니메이션 시작
      window.setTimeout(() => {
        setApiKey(inputValue) // 애니메이션이 끝난 뒤 실제로 키 저장 -> 캐릭터 선택 화면으로
      }, FLIP_DURATION_MS)
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        setError('유효하지 않은 API 키입니다. 다시 확인해주세요.')
      } else if (status === 400) {
        setError('API 키를 입력해주세요.')
      } else {
        setError('키 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setChecking(false)
    }
  }

  const handleReset = () => {
    clearApiKey()
    setPhase('cover')
    setInputValue('')
    setSubPage('card')
    setCardData(null)
    setCardError(null)
  }

  const coverContent = (
    <>
      <p className="home__note">
        이 페이지에는 메이플스토리가 제공한 메이플스토리 서체가 적용되어 있습니다.
      </p>

      <div className="home__datetime">
        <DateTimeLabel />
      </div>

      <div className="home__content">
        <p className="display home__my">MY</p>

        <div className="home__divider">
          <TickDivider width={300} />
        </div>

        <h1 className="display home__title">MAPLE STORY</h1>

        <div className="home__action-spacer" />

        <form onSubmit={handleSubmitKey} className="home__apikey-form">
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="NEXON API KEY"
            className="home__apikey-input"
            autoComplete="off"
            disabled={checking || phase === 'flipping'}
          />
          <button
            type="submit"
            className="home__apikey-submit"
            disabled={checking || phase === 'flipping'}
          >
            {checking ? '확인 중...' : '확인'}
          </button>
        </form>
        {error && <p className="home__apikey-error">{error}</p>}
        <p className="home__apikey-hint">
          넥슨 오픈 API(openapi.nexon.com)에서 발급받은 개인 API 키를 입력하면
          내 캐릭터 카드와 아카이브 카테고리를 볼 수 있어요. 이 브라우저에만 저장됩니다.
        </p>

        <p className="home__caption">HISTORY LINE FOR MY MAPLESTORY</p>
      </div>
    </>
  )

  const resultContent = (
    <>
      <p className="home__result-note">
        이 페이지에는 메이플스토리가 제공한
        메이플스토리 서체가 적용되어 있습니다.
      </p>
      <div className="home__result-datetime">
        <DateTimeLabel />
      </div>

      <div className="home__result-content">
        <p className="display home__result-my">MY</p>
        <div className="home__result-divider">
          <TickDivider width={220} />
        </div>
        <h1 className="display home__result-title">MAPLE STORY</h1>
        <div className="home__result-arrow-spacer" />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="home__result-arrow">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="home__result-caption">HISTORY LINE FOR MY MAPLESTORY</p>
      </div>
    </>
  )

  // 2단계: 키는 확인됐지만 아직 캐릭터를 선택하지 않은 경우
  if (isKeySet && !hasSelectedCharacter) {
    return (
      <section className="home__select-page">
        <CharacterSelect
          savedCharacters={savedCharacters}
          onAdd={addCharacter}
          onSelect={selectCharacter}
        />
        <button onClick={handleReset} className="home__reset-link">
          API 키 초기화
        </button>
      </section>
    )
  }

  // 3단계: 선택한 캐릭터의 카드 (또는 아카이브)
  if (isKeySet && hasSelectedCharacter && subPage === 'card') {
    const mappedCharacter = cardData
      ? {
          nickname: cardData.characterName,
          worldName: cardData.worldName,
          level: cardData.characterLevel,
          jobName: cardData.characterClass,
          popularity: cardData.popularity,
          guildName: cardData.guildName,
          imageUrl: cardData.characterImage,
        }
      : null

    return (
      <section className="char-card-page">
        {cardLoading && <p>캐릭터 정보를 불러오는 중...</p>}
        {cardError && <p className="home__apikey-error">{cardError}</p>}
        {!cardLoading && !cardError && mappedCharacter && (
          <CharacterSummaryCard character={mappedCharacter} />
        )}

        <button
          onClick={() => setSubPage('archive')}
          aria-label="아카이브로 이동"
          className="char-card-page__next"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={clearSelectedCharacter} className="char-card-page__reset">
          다른 캐릭터 선택
        </button>
        <button onClick={handleReset} className="char-card-page__reset">
          API 키 초기화
        </button>
      </section>
    )
  }

  if (isKeySet && hasSelectedCharacter) {
    return (
      <section className="home__result">
        <Book maxWidth={COMPACT_BOOK_MAX_WIDTH}>{resultContent}</Book>

        <div className="home__side">
          <CategoryPanel categories={CATEGORIES} active={active} onSelect={setActive} />
          <button onClick={handleReset} className="home__reset-link">
            API 키 초기화
          </button>
        </div>

        <div className="home__history">
          <p className="home__history-placeholder">
            '{CATEGORIES.find((c) => c.key === active)?.label}' 카테고리 히스토리 영역 (연동 예정)
          </p>
        </div>
      </section>
    )
  }

  // 1단계: 표지(API 키 입력 화면) + 페이지 넘김 애니메이션 중인 상태
  return (
    <section className="home">
      <div className="home__flip-stage">
        {phase === 'flipping' && (
          <div className="home__flip-back">
            <Book maxWidth={COVER_BOOK_MAX_WIDTH}>{resultContent}</Book>
          </div>
        )}
        <div
          className={
            'home__flip-front' + (phase === 'flipping' ? ' home__flip-front--turning' : '')
          }
        >
          <Book maxWidth={COVER_BOOK_MAX_WIDTH}>{coverContent}</Book>
        </div>
      </div>
    </section>
  )
}
