import { useState } from 'react'
import '../../css/home-shared.css'
import '../../css/home-select.css'

/**
 * recentCharacters는 정상적으로는 {name, worldName} 객체 배열이지만,
 * 혹시 예전 버전(문자열 배열)이거나 props 자체가 안 넘어와 undefined/null인 경우에도
 * 화면이 죽지 않도록 방어한다.
 */
function normalize(recentCharacters) {
  if (!Array.isArray(recentCharacters)) return []
  return recentCharacters
    .map((c) => (typeof c === 'string' ? { name: c, worldName: '미확인' } : c))
    .filter((c) => c?.name)
}

/**
 * 검색해서 추가한 캐릭터들을 월드(서버)별로 묶어서 보여준다. 같은 월드끼리
 * 모아두면 나중에 캐릭터가 많아져도 어디 서버 캐릭터인지 한눈에 구분된다.
 * Map을 쓰는 이유는 "먼저 등장한 월드 순서"를 그대로 유지하기 위함(최근 검색순).
 */
function groupByWorld(characters) {
  const groups = new Map()
  for (const c of characters) {
    if (!groups.has(c.worldName)) groups.set(c.worldName, [])
    groups.get(c.worldName).push(c)
  }
  return groups
}

export default function CharacterSelectPage({
  recentCharacters,
  maxRecentCharacters,
  onSelectCharacter,
  onAddCharacter,
  onRemoveCharacter,
}) {
  const [nameInput, setNameInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)

  const characters = normalize(recentCharacters)
  const groups = groupByWorld(characters)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed || adding) return

    setAdding(true)
    setAddError(null)
    try {
      await onAddCharacter(trimmed)
      setNameInput('')
    } catch {
      setAddError('캐릭터를 찾을 수 없습니다. 닉네임을 다시 확인해주세요.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="home__select-content">
      <h2 className="display home__select-title">캐릭터 선택</h2>
      <p className="home__select-hint">
        API 키 확인 완료! 캐릭터 닉네임을 검색해보세요.
      </p>

      <form onSubmit={handleSubmit} className="home__select-form">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="캐릭터 닉네임 검색"
          className="home__select-input"
          autoComplete="off"
          disabled={adding}
        />
        <button type="submit" className="home__select-submit" disabled={adding}>
          {adding ? '조회 중...' : '검색하고 보기'}
        </button>
      </form>
      {addError && <p className="home__apikey-error">{addError}</p>}

      {characters.length > 0 && (
        <div className="home__select-groups">
          {[...groups.entries()].map(([worldName, worldCharacters]) => (
            <div key={worldName} className="home__select-group">
              <p className="home__select-group-title">{worldName}</p>
              <div className="home__select-list">
                {worldCharacters.map((c) => (
                  <div key={c.name} className="home__select-chip-row">
                    <button onClick={() => onSelectCharacter(c.name)} className="home__select-chip">
                      {c.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveCharacter(c.name)}
                      className="home__select-chip-remove"
                      aria-label={`${c.name} 목록에서 삭제`}
                      title="목록에서 삭제"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="home__select-limit">최근 검색한 캐릭터를 최대 {maxRecentCharacters}개까지 기억해요.</p>
    </div>
  )
}
