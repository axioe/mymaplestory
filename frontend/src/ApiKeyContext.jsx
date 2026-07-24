import { createContext, useContext, useEffect, useState } from 'react'

const ApiKeyContext = createContext(null)

const API_KEY_STORAGE = 'mms-nexon-api-key'
const SAVED_CHARACTERS_STORAGE = 'mms-saved-characters'
const SELECTED_CHARACTER_STORAGE = 'mms-selected-character'

const MAX_RECENT_CHARACTERS = 5

/**
 * 예전 버전은 savedCharacters를 문자열 배열, 그 다음엔 서버별 그룹핑용
 * { name, worldName } 객체 배열로 저장했다. 지금은 "최근 검색한 캐릭터"
 * 개념으로 바뀌었지만 저장 형태 자체는 { name, worldName }를 그대로 쓰고
 * (표시할 때 참고용으로), 순서만 "최근 검색순"으로 다룬다.
 */
function loadRecentCharacters() {
  try {
    const raw = localStorage.getItem(SAVED_CHARACTERS_STORAGE)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => {
        if (typeof item === 'string') return { name: item, worldName: '미확인' }
        if (item && typeof item === 'object') {
          return { name: item.name || '', worldName: item.worldName || '미확인' }
        }
        return { name: '', worldName: '미확인' }
      })
      .filter((item) => item.name)
      .slice(0, MAX_RECENT_CHARACTERS)
  } catch {
    return []
  }
}

/**
 * 이 서비스는 회원가입/로그인 기능을 제공하지 않는다.
 * 흐름: ① 넥슨 오픈 API 키를 먼저 입력받아 검증 -> ② 통과하면
 * 최근 검색한 캐릭터(최대 5개) 중에서 고르거나 새로 검색 -> ③ 선택한 캐릭터 카드 표시.
 *
 * 중요: 넥슨 오픈 API 키는 특정 계정에 연결된 인증키가 아니라 공개 데이터 조회용
 * 키(요청 한도 관리용)라서, 키만으로 "이 키의 소유자가 가진 캐릭터 목록"을 서버가
 * 내려줄 방법이 없다. 그래서 "내 캐릭터 중 고르기"는 사용자가 검색했던 캐릭터
 * 목록(로컬 저장, 최근 5개까지만 유지) 중에서 고르는 방식으로 구현했다.
 */
export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  // recentCharacters: [{ name, worldName }] - 배열의 맨 앞이 가장 최근에 검색한 캐릭터
  const [recentCharacters, setRecentCharacters] = useState(loadRecentCharacters)
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
    localStorage.setItem(SAVED_CHARACTERS_STORAGE, JSON.stringify(recentCharacters))
  }, [recentCharacters])

  useEffect(() => {
    if (selectedCharacter) {
      localStorage.setItem(SELECTED_CHARACTER_STORAGE, selectedCharacter)
    } else {
      localStorage.removeItem(SELECTED_CHARACTER_STORAGE)
    }
  }, [selectedCharacter])

  const setApiKey = (key) => setApiKeyState(key.trim())

  /**
   * 새로 검색한 캐릭터를 "가장 최근"으로 맨 앞에 올리고, 이미 있던 캐릭터면
   * 중복 없이 위치만 앞으로 옮긴다. 5개를 넘으면 가장 오래된 것부터 밀어낸다.
   */
  const addCharacter = (name, worldName) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setRecentCharacters((list) => {
      const withoutExisting = list.filter((c) => c.name !== trimmed)
      const next = [{ name: trimmed, worldName: worldName || '미확인' }, ...withoutExisting]
      return next.slice(0, MAX_RECENT_CHARACTERS)
    })
    setSelectedCharacterState(trimmed)
  }

  const removeCharacter = (name) => {
    setRecentCharacters((list) => list.filter((c) => c.name !== name))
    if (selectedCharacter === name) setSelectedCharacterState('')
  }

  // 목록에서 캐릭터를 고르는 것도 "다시 검색한 것"으로 보고 맨 앞으로 올린다.
  const selectCharacter = (name) => {
    setRecentCharacters((list) => {
      const existing = list.find((c) => c.name === name)
      if (!existing) return list
      return [existing, ...list.filter((c) => c.name !== name)]
    })
    setSelectedCharacterState(name)
  }

  const clearSelectedCharacter = () => setSelectedCharacterState('')

  const clearApiKey = () => {
    setApiKeyState('')
    setSelectedCharacterState('')
    // 최근 검색 목록 자체는 키 초기화와 별개로 남겨둔다 (다시 로그인 시 재사용).
  }

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        isKeySet: apiKey.length > 0,
        recentCharacters,
        maxRecentCharacters: MAX_RECENT_CHARACTERS,
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
