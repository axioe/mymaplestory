import { useState } from 'react'
import '../css/character-select.css'

/**
 * 계획서 요청 반영: API 키를 먼저 받아 검증한 뒤(별도 단계),
 * 그 다음 화면에서 등록해둔 캐릭터 중 하나를 고르거나 새로 추가한다.
 */
export default function CharacterSelect({ savedCharacters, onAdd, onSelect }) {
  const [nameInput, setNameInput] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!nameInput.trim()) return
    onAdd(nameInput)
    setNameInput('')
  }

  return (
    <div className="character-select">
      <h2 className="display character-select__title">캐릭터 선택</h2>
      <p className="character-select__hint">
        API 키 확인이 끝났어요. 조회할 캐릭터를 골라주세요.
      </p>

      {savedCharacters.length > 0 && (
        <div className="character-select__list">
          {savedCharacters.map((name) => (
            <button key={name} onClick={() => onSelect(name)} className="character-select__chip">
              {name}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="character-select__form">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="캐릭터 닉네임 추가"
          className="character-select__input"
          autoComplete="off"
        />
        <button type="submit" className="character-select__submit">
          추가하고 보기
        </button>
      </form>
    </div>
  )
}
