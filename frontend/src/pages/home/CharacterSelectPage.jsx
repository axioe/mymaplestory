import { useState } from 'react'
import '../../css/home-shared.css'
import '../../css/home-select.css'

/**
 * savedCharacters는 정상적으로는 {name, worldName} 객체 배열이지만,
 * 혹시 예전 버전(문자열 배열)이 섞여 있어도 "undefined"가 화면에 뜨지 않도록 방어한다.
 */
function groupByServer(savedCharacters) {
  return savedCharacters.reduce((acc, c) => {
    const name = typeof c === 'string' ? c : c?.name
    const world = (typeof c === 'string' ? null : c?.worldName) || '미확인'
    if (!name) return acc
    if (!acc[world]) acc[world] = []
    acc[world].push(name)
    return acc
  }, {})
}

export default function CharacterSelectPage({ savedCharacters, onSelectCharacter, onAddCharacter }) {
  const [nameInput, setNameInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [expandedServer, setExpandedServer] = useState(null)

  const serverGroups = groupByServer(savedCharacters)
  const serverNames = Object.keys(serverGroups)

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
                        onClick={() => onSelectCharacter(name)}
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

      <form onSubmit={handleSubmit} className="home__select-form">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="캐릭터 닉네임 추가"
          className="home__select-input"
          autoComplete="off"
          disabled={adding}
        />
        <button type="submit" className="home__select-submit" disabled={adding}>
          {adding ? '조회 중...' : '추가하고 보기'}
        </button>
      </form>
      {addError && <p className="home__apikey-error">{addError}</p>}
    </div>
  )
}
