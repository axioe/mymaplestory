import { createContext, useContext, useEffect, useState } from 'react'

const ApiKeyContext = createContext(null)

const API_KEY_STORAGE = 'mms-nexon-api-key'
const SAVED_CHARACTERS_STORAGE = 'mms-saved-characters'
const SELECTED_CHARACTER_STORAGE = 'mms-selected-character'

/**
 * 이전 버전은 savedCharacters를 문자열 배열로 저장했다. 지금은 서버별 그룹핑을 위해
 * { name, worldName } 객체 배열로 바꿨는데, 기존에 저장해둔 사용자를 위해 마이그레이션한다.
 */
function loadSavedCharacters() {
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
  } catch {
    return []
  }
}

/**
 * 이 서비스는 회원가입/로그인 기능을 제공하지 않는다.
 * 흐름: ① 넥슨 오픈 API 키를 먼저 입력받아 검증 -> ② 통과하면
 * 그동안 등록해둔 캐릭터 중에서 서버별로 고르거나 새로 추가 -> ③ 선택한 캐릭터 카드 표시.
 *
 * 중요: 넥슨 오픈 API 키는 특정 계정에 연결된 인증키가 아니라 공개 데이터 조회용
 * 키(요청 한도 관리용)라서, 키만으로 "이 키의 소유자가 가진 캐릭터 목록"을 서버가
 * 내려줄 방법이 없다. 그래서 "내 캐릭터 중 고르기"는 사용자가 등록해둔 캐릭터
 * 목록(로컬 저장, 등록 시 서버명을 함께 조회해 저장) 중에서 고르는 방식으로 구현했다.
 */
export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  // savedCharacters: [{ name, worldName }]
  const [savedCharacters, setSavedCharacters] = useState(loadSavedCharacters)
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

  // 캐릭터 추가는 이제 서버명(worldName)을 함께 받는다 (Home.jsx에서 조회 후 호출).
  const addCharacter = (name, worldName) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSavedCharacters((list) => {
      const withoutExisting = list.filter((c) => c.name !== trimmed)
      return [...withoutExisting, { name: trimmed, worldName: worldName || '미확인' }]
    })
    setSelectedCharacterState(trimmed)
  }

  const removeCharacter = (name) => {
    setSavedCharacters((list) => list.filter((c) => c.name !== name))
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
