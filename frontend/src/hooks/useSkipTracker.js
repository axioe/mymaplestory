import { useEffect, useState } from 'react'
import { fetchSkips, setSkip as setSkipApi } from '../api/client.js'

/**
 * 넥슨 API는 완료 여부만 읽기 전용으로 내려주고, "이건 오늘/이번 주에 스킵할래"
 * 같은 개인 표시는 넥슨 쪽에 저장할 방법이 없다. 그래서 이건 순수하게 우리
 * 서비스 안에서만 쓰는 개인 메모 기능인데, 예전엔 브라우저 localStorage에만
 * 저장했다가 기기를 바꾸면 사라지는 문제가 있어서 백엔드 DB로 옮겼다.
 * 캐릭터별로 구분해서 저장한다 (다른 캐릭터끼리 체크 상태가 섞이지 않도록).
 */
export function useSkipTracker(characterName) {
  const [skippedNames, setSkippedNames] = useState([]) // 스킵된 contentName 목록

  useEffect(() => {
    if (!characterName) {
      setSkippedNames([])
      return
    }
    let cancelled = false
    fetchSkips(characterName)
      .then((data) => {
        if (!cancelled) setSkippedNames((data ?? []).map((s) => s.contentName))
      })
      .catch(() => {
        if (!cancelled) setSkippedNames([])
      })
    return () => {
      cancelled = true
    }
  }, [characterName])

  const isSkipped = (contentName) => skippedNames.includes(contentName)

  const toggleSkip = (contentName) => {
    const next = !isSkipped(contentName)
    setSkippedNames((prev) => (next ? [...prev, contentName] : prev.filter((n) => n !== contentName)))
    setSkipApi(characterName, contentName, next).catch(() => {})
  }

  return { isSkipped, toggleSkip }
}
