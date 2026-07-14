import { createContext, useContext, useEffect, useState } from 'react'

const ApiKeyContext = createContext(null)

const API_KEY_STORAGE = 'mms-nexon-api-key'
const SAVED_CHARACTERS_STORAGE = 'mms-saved-characters'
const SELECTED_CHARACTER_STORAGE = 'mms-selected-character'

/**
 * 이 서비스는 회원가입/로그인 기능을 제공하지 않는다.
 * 흐름: ① 넥슨 오픈 API 키를 먼저 입력받아 검증 -> ② 통과하면
 * 그동안 등록해둔 캐릭터 닉네임 중에서 고르거나 새로 추가 -> ③ 선택한 캐릭터 카드 표시.
 *
 * 참고: 넥슨 오픈 API 키는 계정 전체에 연결된 "내 캐릭터 목록"을 자동으로 내려주는
 * OAuth 스코프가 아니라 캐릭터명으로 조회하는 공개 API 키다. 그래서 "내 캐릭터 중 고르기"는
 * 사용자가 등록해둔 닉네임 목록(로컬 저장) 중에서 고르는 방식으로 구현했다.
 */
export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  const [savedCharacters, setSavedCharacters] = useState(() => {
    try {
      const raw = localStorage.getItem(SAVED_CHARACTERS_STORAGE)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [selectedCharacter, setSelectedCharacterState] = useState(
    () => localStorage.getItem(SELECTED_CHARACTER_STORAGE) || ''
  )

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE, apiKey)
    } else {
      localStorage.removeItem(API_KEY_STORAGE)
    }
  }, [apiKey])

  useEffect(() => {
    localStorage.setItem(SAVED_CHARACTERS_STORAGE, JSON.stringify(savedCharacters))
  }, [savedCharacters])

  useEffect(() => {
    if (selectedCharacter) {
      localStorage.setItem(SELECTED_CHARACTER_STORAGE, selectedCharacter)
    } else {
      localStorage.removeItem(SELECTED_CHARACTER_STORAGE)
    }
  }, [selectedCharacter])

  const setApiKey = (key) => setApiKeyState(key.trim())

  const addCharacter = (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSavedCharacters((list) => (list.includes(trimmed) ? list : [...list, trimmed]))
    setSelectedCharacterState(trimmed)
  }

  const removeCharacter = (name) => {
    setSavedCharacters((list) => list.filter((c) => c !== name))
    if (selectedCharacter === name) setSelectedCharacterState('')
  }

  const selectCharacter = (name) => setSelectedCharacterState(name)
  const clearSelectedCharacter = () => setSelectedCharacterState('')

  const clearApiKey = () => {
    setApiKeyState('')
    setSelectedCharacterState('')
    // 저장해둔 캐릭터 목록 자체는 키 초기화와 별개로 남겨둔다 (다시 로그인 시 재사용).
  }

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        isKeySet: apiKey.length > 0,
        savedCharacters,
        selectedCharacter,
        hasSelectedCharacter: selectedCharacter.length > 0,
        setApiKey,
        addCharacter,
        removeCharacter,
        selectCharacter,
        clearSelectedCharacter,
        clearApiKey,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext)
  if (!ctx) throw new Error('useApiKey must be used within ApiKeyProvider')
  return ctx
}
