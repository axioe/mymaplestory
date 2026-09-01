import { useState } from 'react'
import Modal from '../../../components/Modal.jsx'
import { useAccountCharacters } from '../../../hooks/useAccountCharacters.js'
import '../../../css/home-select.css'
import '../../../css/quick-switch.css'

/**
 * CharacterSelectPage.jsx의 groupByWorld와 같은 방식 - API가 내려준 순서를
 * 유지하려고 Map을 쓴다.
 */
function groupByWorld(characters) {
  const groups = new Map()
  for (const c of characters) {
    if (!groups.has(c.worldName)) groups.set(c.worldName, [])
    groups.get(c.worldName).push(c)
  }
  for (const list of groups.values()) {
    list.sort((a, b) => (b.characterLevel ?? 0) - (a.characterLevel ?? 0))
  }
  return groups
}

/**
 * 우측 상단 고정 버튼 + 모달 - 캐릭터 카드/아카이브 어디서든 서버 선택부터
 * 다시 거치지 않고 계정의 다른 캐릭터로 바로 전환한다. 기존 "다른 캐릭터
 * 선택"(카드 페이지 하단 링크)은 서버 선택 -> 캐릭터 선택 두 단계를 다시
 * 거쳐야 해서, 부캐가 많은 유저가 자주 오가기엔 느렸다.
 *
 * 계정 캐릭터 목록은 이 위젯이 열릴 때만 조회한다(항상 떠 있는 버튼이라고
 * 항상 조회하면 낭비니까) - useAccountCharacters를 select 페이지용과는
 * 별도 인스턴스로 또 호출한다.
 */
export default function QuickSwitchWidget({ apiKey, currentCharacterName, onSwitch }) {
  const [open, setOpen] = useState(false)
  const { characters, loading, error } = useAccountCharacters(open, apiKey)
  const groups = groupByWorld(characters ?? [])

  const handleSelect = (character) => {
    if (character.characterName === currentCharacterName) return
    setOpen(false)
    onSwitch(character)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="다른 캐릭터로 전환"
        className="quick-switch__trigger"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 7h13M17 7l-3.5-3.5M17 7l-3.5 3.5M20 17H7M7 17l3.5-3.5M7 17l3.5 3.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="캐릭터 전환">
        {loading && <p className="home__select-hint">내 캐릭터 목록을 불러오는 중...</p>}
        {error && <p className="home__apikey-error">{error}</p>}

        {!loading && !error && characters.length === 0 && (
          <p className="home__select-hint">이 API 키에 연결된 캐릭터를 찾지 못했어요.</p>
        )}

        {!loading && !error && groups.size > 0 && (
          <div className="quick-switch__groups">
            {[...groups.entries()].map(([worldName, worldCharacters]) => (
              <div key={worldName} className="quick-switch__group">
                <p className="quick-switch__world">{worldName}</p>
                <div className="quick-switch__list">
                  {worldCharacters.map((c) => {
                    const isCurrent = c.characterName === currentCharacterName
                    return (
                      <button
                        key={c.ocid}
                        type="button"
                        onClick={() => handleSelect(c)}
                        disabled={isCurrent}
                        className={'quick-switch__item' + (isCurrent ? ' quick-switch__item--current' : '')}
                      >
                        <span>{c.characterName}</span>
                        <span className="quick-switch__item-meta">
                          {isCurrent ? '보는 중' : `${c.characterClass} · Lv.${c.characterLevel}`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  )
}
