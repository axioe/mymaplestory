import { createContext, useContext, useEffect, useState } from 'react'

const ApiKeyContext = createContext(null)

const API_KEY_STORAGE = 'mms-nexon-api-key'
const SELECTED_CHARACTER_STORAGE = 'mms-selected-character'

/**
 * 이 서비스는 회원가입/로그인 기능을 제공하지 않는다.
 * 흐름: ① 넥슨 오픈 API 키를 먼저 입력받아 검증 -> ② 통과하면 이 키 계정에
 * 연결된 전체 캐릭터 목록(/api/auth/characters)을 바로 불러와서 그중에서
 * 고른다 -> ③ 선택한 캐릭터 카드 표시.
 *
 * 예전엔 "API 키만으로는 계정의 캐릭터 목록을 알 수 없다"고 알고 있어서
 * 사용자가 검색한 캐릭터를 로컬에 최근 5개까지 저장해두는 방식으로
 * 구현했었는데, 실제로는 /character/list라는 계정 전체 캐릭터 목록
 * 엔드포인트가 있다는 게 확인되어(사용자가 직접 응답 예시를 확인해줌),
 * 그 방식은 전부 걷어내고 API로 바로 목록을 받아오는 방식으로 바꿨다.
 * (useAccountCharacters 훅이 그 조회를 담당한다.)
 */
export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
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
    if (selectedCharacter) {
      localStorage.setItem(SELECTED_CHARACTER_STORAGE, selectedCharacter)
    } else {
      localStorage.removeItem(SELECTED_CHARACTER_STORAGE)
    }
  }, [selectedCharacter])

  const setApiKey = (key) => setApiKeyState(key.trim())

  const selectCharacter = (name) => setSelectedCharacterState(name)

  const clearSelectedCharacter = () => setSelectedCharacterState('')

  const clearApiKey = () => {
    setApiKeyState('')
    setSelectedCharacterState('')
  }

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        isKeySet: apiKey.length > 0,
        selectedCharacter,
        hasSelectedCharacter: selectedCharacter.length > 0,
        setApiKey,
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
