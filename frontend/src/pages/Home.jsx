import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Book from '../components/Book.jsx'
import TickDivider from '../components/TickDivider.jsx'
import DateTimeLabel from '../components/DateTimeLabel.jsx'
import CategoryPanel from '../components/CategoryPanel.jsx'
import CharacterSummaryCard from '../components/CharacterSummaryCard.jsx'
import { useApiKey } from '../ApiKeyContext.jsx'
import { validateApiKey, fetchCharacterCard, fetchLevelHistory } from '../api/client.js'
import '../css/home.css'

const CATEGORIES = [
  { key: 'boss', label: '보스' },
  { key: 'loot', label: '전리품' },
  { key: 'level', label: '레벨' },
  { key: 'story', label: '스토리' },
]

const BOOK_MAX_WIDTH = 1060
const COMPACT_BOOK_MAX_WIDTH = 760
const FLIP_DURATION_MS = 1600 // css .home__flip-right 의 transition 시간과 반드시 맞출 것
const INTRO_DURATION_MS = 1000 // css .home__flip-stage--intro 애니메이션 시간과 반드시 맞출 것

/**
 * 전체 흐름을 "책 페이지를 넘기는" 하나의 동작으로 통일한다.
 * 페이지 순서: start(표지) -> apikey(키 입력) -> select(캐릭터 선택) -> card(캐릭터 카드)
 * 페이지가 바뀔 때마다 책의 오른쪽 절반이 책등을 축으로 넘어가며 다음 내용이 드러난다.
 * 표지도 새로 디자인하지 않고 기존 Book 컴포넌트를 그대로 재사용한다.
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
  const [page, setPage] = useState(initialPage)
  // 표지(start)로 처음 들어온 경우에만, 책이 반으로 접힌 상태에서 펼쳐지는 인트로를 1회 재생한다.
  const [introPlaying, setIntroPlaying] = useState(initialPage === 'start')
  const [pendingPage, setPendingPage] = useState(null)
  const flipping = pendingPage !== null

  const [apiKeyInput, setApiKeyInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [addingCharacter, setAddingCharacter] = useState(false)
  const [addError, setAddError] = useState(null)
  const [expandedServer, setExpandedServer] = useState(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)

  const [active, setActive] = useState('boss')
  const [archiveView, setArchiveView] = useState(false)
  const [levelHistory, setLevelHistory] = useState(null)
  const [levelHistoryLoading, setLevelHistoryLoading] = useState(false)
  const [levelHistoryError, setLevelHistoryError] = useState(null)

  const [cardData, setCardData] = useState(null)
  const [cardLoading, setCardLoading] = useState(false)
  const [cardError, setCardError] = useState(null)

  // 접혀있던 책이 펼쳐지는 인트로 애니메이션이 끝나면, 이후의 페이지 전환(플립)과
  // 애니메이션이 겹치지 않도록 인트로 클래스를 떼어낸다.
  useEffect(() => {
    if (!introPlaying) return
    const timer = window.setTimeout(() => setIntroPlaying(false), INTRO_DURATION_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // MenuButton의 "홈으로" 클릭을 처리한다. 이미 "/" 위에 있을 때는 라우트가
  // 안 바뀌어서 아무 반응이 없었던 버그 수정 - state로 전달된 타임스탬프를 감지해서
  // 화면을 강제로 되돌린다. API 키까지 지우진 않고, 캐릭터 선택 단계로 되돌아간다.
  useEffect(() => {
    if (!location.state?.resetAt) return
    setPendingPage(null)
    setArchiveView(false)
    setCardData(null)
    setCardError(null)
    clearSelectedCharacter()
    setPage(isKeySet ? 'select' : 'start')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  // 캐릭터가 선택되는 즉시(플립 애니메이션이 진행되는 동안) 미리 데이터를 불러온다.
  useEffect(() => {
    if (!hasSelectedCharacter) return
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
  }, [hasSelectedCharacter, selectedCharacter])

  // 아카이브에서 "레벨" 카테고리를 볼 때만 레벨/경험치 히스토리를 조회한다.
  useEffect(() => {
    if (!archiveView || active !== 'level' || !hasSelectedCharacter) return
    let cancelled = false
    setLevelHistoryLoading(true)
    setLevelHistoryError(null)
    fetchLevelHistory(selectedCharacter, 14)
      .then((data) => {
        if (!cancelled) setLevelHistory(data)
      })
      .catch(() => {
        if (!cancelled) setLevelHistoryError('레벨 히스토리를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLevelHistoryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [archiveView, active, hasSelectedCharacter, selectedCharacter])

  const flipTo = (next) => {
    setPendingPage(next)
    window.setTimeout(() => {
      setPage(next)
      setPendingPage(null)
    }, FLIP_DURATION_MS)
  }

  const handleStart = () => flipTo('apikey')

  const handleSubmitKey = async (e) => {
    e.preventDefault()
    if (!apiKeyInput.trim() || checking) return

    setChecking(true)
    setError(null)
    try {
      await validateApiKey(apiKeyInput.trim())
      setApiKey(apiKeyInput)
      flipTo('select')
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

  const handleSelectCharacter = (name) => {
    selectCharacter(name)
    flipTo('card')
  }

  const handleAddCharacter = async (e) => {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed || addingCharacter) return

    setAddingCharacter(true)
    setAddError(null)
    try {
      const data = await fetchCharacterCard(trimmed)
      addCharacter(trimmed, data.worldName)
      setCardData(data) // 방금 조회한 데이터를 바로 캐시해서 카드 페이지에서 재조회 안 해도 되게
      setNameInput('')
      flipTo('card')
    } catch (err) {
      setAddError('캐릭터를 찾을 수 없습니다. 닉네임을 다시 확인해주세요.')
    } finally {
      setAddingCharacter(false)
    }
  }

  const handleReset = () => {
    clearApiKey()
    setPage('start')
    setPendingPage(null)
    setApiKeyInput('')
    setNameInput('')
    setArchiveView(false)
    setCardData(null)
    setCardError(null)
  }

  // "다른 캐릭터 선택" - 카드 페이지에서 선택 페이지로 되돌아간다.
  // clearSelectedCharacter만 호출하면 context 값만 바뀌고 화면(page)은 그대로였던 버그 수정.
  const handleBackToSelect = () => {
    clearSelectedCharacter()
    setPendingPage(null)
    setPage('select')
    setCardData(null)
    setCardError(null)
  }

  const startContent = (
    <div className="home__content">
      <p className="display home__my">MY</p>
      <div className="home__divider">
        <TickDivider width={300} />
      </div>
      <h1 className="display home__title">MAPLE STORY</h1>
      <div className="home__action-spacer" />
      <button onClick={handleStart} className="home__apikey-submit" disabled={flipping}>
        시작하기
      </button>
      <p className="home__caption">HISTORY LINE FOR MY MAPLESTORY</p>
    </div>
  )

  const apiKeyContent = (
    <>
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
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="NEXON API KEY"
            className="home__apikey-input"
            autoComplete="off"
            disabled={checking || flipping}
          />
          <button type="submit" className="home__apikey-submit" disabled={checking || flipping}>
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

  // 저장된 캐릭터를 서버(월드)별로 묶는다.
  // savedCharacters는 정상적으로는 {name, worldName} 객체 배열이지만,
  // 혹시 예전 버전(문자열 배열)이 섞여 있어도 "undefined"가 화면에 뜨지 않도록 방어한다.
  const serverGroups = savedCharacters.reduce((acc, c) => {
    const name = typeof c === 'string' ? c : c?.name
    const world = (typeof c === 'string' ? null : c?.worldName) || '미확인'
    if (!name) return acc
    if (!acc[world]) acc[world] = []
    acc[world].push(name)
    return acc
  }, {})
  const serverNames = Object.keys(serverGroups)

  const selectContent = (
    <div className="home__select-content">
      <h2 className="display home__select-title">캐릭터 선택</h2>
      <p className="home__select-hint">API 키 확인 완료! 서버를 눌러 캐릭터를 골라주세요.</p>

      {serverNames.length > 0 && (
        <div className="home__server-list">
          {serverNames.map((world) => {
            const isOpen = expandedServer === world
            return (
              <div key={world} className="home__server-group">
                <button
                  onClick={() => setExpandedServer(isOpen ? null : world)}
                  className={'home__server-button' + (isOpen ? ' home__server-button--open' : '')}
                >
                  <span>{world}</span>
                  <span className="home__server-count">{serverGroups[world].length}</span>
                </button>

                {isOpen && (
                  <div className="home__select-list">
                    {serverGroups[world].map((name) => (
                      <button
                        key={name}
                        onClick={() => handleSelectCharacter(name)}
                        className="home__select-chip"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={handleAddCharacter} className="home__select-form">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="캐릭터 닉네임 추가"
          className="home__select-input"
          autoComplete="off"
          disabled={addingCharacter}
        />
        <button type="submit" className="home__select-submit" disabled={addingCharacter}>
          {addingCharacter ? '조회 중...' : '추가하고 보기'}
        </button>
      </form>
      {addError && <p className="home__apikey-error">{addError}</p>}
    </div>
  )

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

  const cardContent = (
    <div className="home__card-content">
      {cardLoading && <p>캐릭터 정보를 불러오는 중...</p>}
      {cardError && <p className="home__apikey-error">{cardError}</p>}
      {!cardLoading && !cardError && mappedCharacter && (
        <CharacterSummaryCard character={mappedCharacter} />
      )}

      <button
        onClick={() => setArchiveView(true)}
        aria-label="아카이브로 이동"
        className="home__card-next"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="home__card-links">
        <button onClick={handleBackToSelect} className="home__card-link">
          다른 캐릭터 선택
        </button>
        <button onClick={handleReset} className="home__card-link">
          API 키 초기화
        </button>
      </div>
    </div>
  )

  const activeLabel = CATEGORIES.find((c) => c.key === active)?.label

  // 아카이브 화면에서 책 안에 보여줄 내용. 카테고리별로 달라진다.
  const archiveBookContent = (
    <>
      <div className="home__result-datetime">
        <DateTimeLabel />
      </div>

      {active === 'level' ? (
        <div className="home__level-content">
          <h2 className="display home__select-title">레벨 진척도</h2>

          {levelHistoryLoading && <p>최근 기록을 불러오는 중...</p>}
          {levelHistoryError && <p className="home__apikey-error">{levelHistoryError}</p>}

          {!levelHistoryLoading && !levelHistoryError && levelHistory && (
            levelHistory.levelUps.length > 0 ? (
              <div className="home__level-table-wrap">
                <table className="home__level-table">
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>변경된 레벨</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelHistory.levelUps.map((lv) => (
                      <tr key={lv.date}>
                        <td>{lv.date}</td>
                        <td>{lv.toLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="home__select-hint">최근 {levelHistory.days}일 동안 레벨업 기록이 없어요.</p>
            )
          )}
        </div>
      ) : (
        <div className="home__result-content">
          <p className="display home__result-my">MY</p>
          <div className="home__result-divider">
            <TickDivider width={220} />
          </div>
          <h1 className="display home__result-title">MAPLE STORY</h1>
          <p className="home__select-hint">'{activeLabel}' 카테고리는 아직 연동 중이에요.</p>
        </div>
      )}
    </>
  )

  function renderPageContent(p) {
    if (p === 'start') return startContent
    if (p === 'apikey') return apiKeyContent
    if (p === 'select') return selectContent
    if (p === 'card') return cardContent
    return null
  }

  // 아카이브 화면 (책+카테고리 패널) - 플립 시스템과 별개의 레이아웃
  if (archiveView) {
    return (
      <section className="home__result">
        <Book maxWidth={COMPACT_BOOK_MAX_WIDTH}>{archiveBookContent}</Book>

        <div className="home__side">
          <CategoryPanel categories={CATEGORIES} active={active} onSelect={setActive} />
          <button onClick={() => setArchiveView(false)} className="home__reset-link">
            ← 캐릭터 카드로
          </button>
        </div>
      </section>
    )
  }

  // apikey / select / card - 책 페이지 넘김으로 이어지는 화면
  return (
    <section className="home">
      <div className={'home__flip-stage' + (introPlaying ? ' home__flip-stage--intro' : '')}>
        <div className="home__flip-base">
          <Book maxWidth={BOOK_MAX_WIDTH}>{renderPageContent(flipping ? pendingPage : page)}</Book>
        </div>
        <div className="home__flip-left">
          <Book maxWidth={BOOK_MAX_WIDTH}>{renderPageContent(page)}</Book>
        </div>
        <div className={'home__flip-right' + (flipping ? ' home__flip-right--turning' : '')}>
          <Book maxWidth={BOOK_MAX_WIDTH}>{renderPageContent(page)}</Book>
        </div>
      </div>
    </section>
  )
}
