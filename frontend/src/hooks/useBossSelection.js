import { useEffect, useState } from 'react'
import { fetchBossSelections, upsertBossSelection, deleteBossSelection, resetBossSelections } from '../api/client.js'
import { isWeeklyLimitExempt } from '../utils/bossHelpers.js'

export const WEEKLY_BOSS_LIMIT = 12
export const MAX_PARTY_SIZE = 6

/**
 * "이번 주에 이 보스는 이 난이도로, 몇 명이서 잡을 거야"를 캐릭터별로 관리한다.
 * 예전엔 브라우저 localStorage에만 저장했는데, 기기를 바꾸면 사라지는 문제가
 * 있어서 백엔드 DB에 저장하도록 옮겼다. 그래서 이제 조회는 비동기(fetch)이고,
 * 선택/해제/인원수 변경도 API 호출이 필요하다 - 화면은 먼저 낙관적으로
 * 갱신하고, 실패해도 조용히 무시한다(다음에 다시 불러오면 서버 상태로 맞춰짐).
 */
export function useBossSelection(characterName) {
  const [list, setList] = useState([]) // [{ bossName, difficulty, partySize, cycle }]
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!characterName) {
      setList([])
      return
    }
    let cancelled = false
    // 캐릭터를 바꿔도 새 응답이 오기 전까지 이전 캐릭터의 list가 그대로 남아있었다.
    // toggle/setPartySize가 이 stale list로 주간 12마리 제한이나 현재 선택 상태를
    // 판단해서, 전환 직후 짧은 순간 잘못 판단하거나(이전 캐릭터 기준 제한 체크)
    // 뒤늦게 도착한 GET 응답이 그 사이의 낙관적 갱신을 통째로 덮어쓰는 문제가 있었다.
    setList([])
    setLoading(true)
    fetchBossSelections(characterName)
      .then((data) => {
        if (!cancelled) setList(data ?? [])
      })
      .catch(() => {
        if (!cancelled) setList([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [characterName])

  const findEntry = (bossName) => list.find((s) => s.bossName === bossName)
  const selectedCount = list.length
  // "시즌 보스 메이린"(챌린저스 월드 한정 보너스 보스)은 주간 12마리 한도에서 제외한다.
  const weeklySelectedCount = list.filter((s) => s.cycle === 'weekly' && !isWeeklyLimitExempt(s.bossName)).length
  const isWeeklyAtLimit = weeklySelectedCount >= WEEKLY_BOSS_LIMIT

  const isSelected = (bossName, difficulty) => findEntry(bossName)?.difficulty === difficulty
  const hasAnySelection = (bossName) => Boolean(findEntry(bossName))
  const getPartySize = (bossName) => findEntry(bossName)?.partySize ?? 1
  // 한도 제외 보스는 이미 12마리가 찼어도 새로 선택할 수 있어야 한다(자기 자신은 한도에
  // 안 걸리니까).
  const isAtLimitFor = (cycle, bossName) => cycle === 'weekly' && isWeeklyAtLimit && !isWeeklyLimitExempt(bossName)

  const toggle = (bossName, difficulty, cycle) => {
    const current = findEntry(bossName)
    const alreadyThisDifficulty = current?.difficulty === difficulty

    if (alreadyThisDifficulty) {
      // 같은 걸 다시 누르면 선택 해제
      setList((prev) => prev.filter((s) => s.bossName !== bossName))
      deleteBossSelection(characterName, bossName).catch(() => {})
      return
    }

    const isNewBoss = !current
    if (isNewBoss && cycle === 'weekly' && !isWeeklyLimitExempt(bossName) && weeklySelectedCount >= WEEKLY_BOSS_LIMIT) {
      // 주간 보스는 이미 12마리 다 찼는데 새로 추가하려는 경우 - 무시
      return
    }

    const partySize = current?.partySize ?? 1
    const next = { bossName, difficulty, partySize, cycle }
    setList((prev) => [...prev.filter((s) => s.bossName !== bossName), next])
    upsertBossSelection(characterName, next).catch(() => {})
  }

  const setPartySize = (bossName, partySize) => {
    const clamped = Math.min(MAX_PARTY_SIZE, Math.max(1, partySize))
    const current = findEntry(bossName)
    if (!current) return
    const next = { ...current, partySize: clamped }
    setList((prev) => prev.map((s) => (s.bossName === bossName ? next : s)))
    upsertBossSelection(characterName, next).catch(() => {})
  }

  const reset = () => {
    setList([])
    resetBossSelections(characterName).catch(() => {})
  }

  return {
    loading,
    selectedCount,
    weeklySelectedCount,
    isWeeklyAtLimit,
    isAtLimitFor,
    isSelected,
    hasAnySelection,
    getPartySize,
    toggle,
    setPartySize,
    reset,
    limit: WEEKLY_BOSS_LIMIT,
    maxPartySize: MAX_PARTY_SIZE,
  }
}
