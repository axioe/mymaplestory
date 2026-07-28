import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mms-scheduler-skip'

function loadSkipMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * 넥슨 API는 완료 여부만 읽기 전용으로 내려주고, "이건 오늘/이번 주에 스킵할래"
 * 같은 개인 표시는 넥슨 쪽에 저장할 방법이 없다. 그래서 이건 순수하게
 * 우리 브라우저(localStorage)에만 저장되는 개인 메모 기능이다.
 * 캐릭터별로 구분해서 저장한다 (다른 캐릭터끼리 체크 상태가 섞이지 않도록).
 */
export function useSkipTracker(characterName) {
  const [skipMap, setSkipMap] = useState(loadSkipMap)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skipMap))
  }, [skipMap])

  const key = (contentName) => `${characterName}:${contentName}`

  const isSkipped = (contentName) => !!skipMap[key(contentName)]

  const toggleSkip = (contentName) => {
    const k = key(contentName)
    setSkipMap((prev) => ({ ...prev, [k]: !prev[k] }))
  }

  return { isSkipped, toggleSkip }
}
