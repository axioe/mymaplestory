import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mms-boss-selection'
export const WEEKLY_BOSS_LIMIT = 12
export const MAX_PARTY_SIZE = 6

function loadMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * "이번 주에 이 보스는 이 난이도로, 몇 명이서 잡을 거야"를 개인적으로 체크해두는 기능.
 * 넥슨 API는 이런 계획을 저장할 방법이 없어서 순수하게 브라우저(localStorage)에만
 * 저장한다. 캐릭터별로 구분해서 저장하고, 데이터 모양은
 * { [characterName]: { [bossName]: { difficulty, partySize, cycle } } } - 보스 하나당
 * 난이도 하나만 저장되므로 같은 보스의 다른 난이도를 고르면 자동으로 이전 선택을
 * 덮어쓴다(라디오 버튼과 같은 동작). 인원수를 안 정했으면 1명(혼자)으로 취급한다.
 *
 * 주간 처치 가능 횟수(12) 제한은 "주간 보스"에만 적용된다 - 일일/월간 보스는
 * 이 한도와 무관하다. 그래서 각 선택에 cycle도 같이 저장해서, 한도를 계산할 때
 * cycle === 'weekly'인 것만 센다.
 */
export function useBossSelection(characterName) {
  const [map, setMap] = useState(loadMap)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  }, [map])

  const charMap = map[characterName] ?? {}
  const selectedCount = Object.keys(charMap).length
  const weeklySelectedCount = Object.values(charMap).filter((v) => v.cycle === 'weekly').length
  const isWeeklyAtLimit = weeklySelectedCount >= WEEKLY_BOSS_LIMIT

  const isSelected = (bossName, difficulty) => charMap[bossName]?.difficulty === difficulty
  const hasAnySelection = (bossName) => bossName in charMap
  const getPartySize = (bossName) => charMap[bossName]?.partySize ?? 1

  // cycle이 'weekly'일 때만 12마리 한도를 적용한다. 일일/월간은 새로 추가할 때
  // 한도 검사를 아예 안 한다.
  const isAtLimitFor = (cycle) => cycle === 'weekly' && isWeeklyAtLimit

  const toggle = (bossName, difficulty, cycle) => {
    setMap((prev) => {
      const current = prev[characterName] ?? {}
      const alreadyThisDifficulty = current[bossName]?.difficulty === difficulty

      if (alreadyThisDifficulty) {
        // 같은 걸 다시 누르면 선택 해제
        const next = { ...current }
        delete next[bossName]
        return { ...prev, [characterName]: next }
      }

      const isNewBoss = !(bossName in current)
      const weeklyCount = Object.values(current).filter((v) => v.cycle === 'weekly').length
      if (isNewBoss && cycle === 'weekly' && weeklyCount >= WEEKLY_BOSS_LIMIT) {
        // 주간 보스는 이미 12마리 다 찼는데 새로 추가하려는 경우 - 무시
        // (일일/월간은 이 검사를 안 거친다)
        return prev
      }

      // 같은 보스의 난이도를 바꾸는 경우 인원수는 유지, 새로 선택하는 경우 1명 기본값
      const prevPartySize = current[bossName]?.partySize ?? 1
      return {
        ...prev,
        [characterName]: { ...current, [bossName]: { difficulty, partySize: prevPartySize, cycle } },
      }
    })
  }

  const setPartySize = (bossName, partySize) => {
    const clamped = Math.min(MAX_PARTY_SIZE, Math.max(1, partySize))
    setMap((prev) => {
      const current = prev[characterName] ?? {}
      if (!(bossName in current)) return prev
      return {
        ...prev,
        [characterName]: { ...current, [bossName]: { ...current[bossName], partySize: clamped } },
      }
    })
  }

  const reset = () => {
    setMap((prev) => ({ ...prev, [characterName]: {} }))
  }

  return {
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
