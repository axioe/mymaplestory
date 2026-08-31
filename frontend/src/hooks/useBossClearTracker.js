import { useEffect, useState } from 'react'
import { fetchBossClears, setBossClear as setBossClearApi } from '../api/client.js'

/**
 * "이번 주에 이 보스를 잡았다" 체크 - useSkipTracker와 같은 방식(존재 여부 = 체크됨)
 * 이지만 완전히 다른 데이터다: 스킵은 영구히 유지되는 개인 표시이고, 이건
 * 백엔드가 매주 목요일(보스 초기화 요일) 기준으로 자동으로 초기화해주는
 * "이번 주" 한정 완료 기록이다(UserPreferenceService.currentBossWeekStart 참고).
 */
export function useBossClearTracker(characterName) {
  const [clearedNames, setClearedNames] = useState([]) // 이번 주 완료된 bossName 목록

  useEffect(() => {
    if (!characterName) {
      setClearedNames([])
      return
    }
    let cancelled = false
    // 캐릭터를 바꾸면 새 응답이 오기 전까지 이전 캐릭터의 완료 목록이 잠깐 남아있어서,
    // 그 사이 toggleCleared를 누르면 "이미 완료됐는지"를 이전 캐릭터 기준으로 판단해버렸다.
    setClearedNames([])
    fetchBossClears(characterName)
      .then((data) => {
        if (!cancelled) setClearedNames((data ?? []).map((c) => c.bossName))
      })
      .catch(() => {
        if (!cancelled) setClearedNames([])
      })
    return () => {
      cancelled = true
    }
  }, [characterName])

  const isCleared = (bossName) => clearedNames.includes(bossName)

  const toggleCleared = (bossName) => {
    const next = !isCleared(bossName)
    setClearedNames((prev) => (next ? [...prev, bossName] : prev.filter((n) => n !== bossName)))
    setBossClearApi(characterName, bossName, next).catch(() => {})
  }

  return { isCleared, toggleCleared }
}
