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

export default function CharacterSelectPage({ recentCharacters, maxRecentCharacters, onSelectCharacter, onAddCharacter }) {
  const [nameInput, setNameInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)

  const characters = normalize(recentCharacters)

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
        <div className="home__select-list">
          {characters.map((c) => (
            <button
              key={c.name}
              onClick={() => onSelectCharacter(c.name)}
              className="home__select-chip"
            >
              {c.name}
              <span className="home__select-chip-world">{c.worldName}</span>
            </button>
          ))}
        </div>
      )}

      <p className="home__select-limit">최근 검색한 캐릭터를 최대 {maxRecentCharacters}개까지 기억해요.</p>
    </div>
  )
}
