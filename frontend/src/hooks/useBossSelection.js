import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mms-boss-selection'
export const WEEKLY_BOSS_LIMIT = 12

function loadMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * "이번 주에 이 보스는 이 난이도로 잡을 거야"를 개인적으로 체크해두는 기능.
 * 넥슨 API는 이런 계획을 저장할 방법이 없어서 순수하게 브라우저(localStorage)에만
 * 저장한다. 캐릭터별로 구분해서 저장하고, 데이터 모양은
 * { [characterName]: { [bossName]: difficulty } } - 보스 하나당 난이도 하나만
 * 저장되므로 같은 보스의 다른 난이도를 고르면 자동으로 이전 선택을 덮어쓴다
 * (라디오 버튼과 같은 동작). 전체 개수는 주간 보스 처치 가능 횟수(12)로 제한한다.
 */
export function useBossSelection(characterName) {
  const [map, setMap] = useState(loadMap)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  }, [map])

  const charMap = map[characterName] ?? {}
  const selectedCount = Object.keys(charMap).length
  const atLimit = selectedCount >= WEEKLY_BOSS_LIMIT

  const isSelected = (bossName, difficulty) => charMap[bossName] === difficulty
  const hasAnySelection = (bossName) => bossName in charMap

  const toggle = (bossName, difficulty) => {
    setMap((prev) => {
      const current = prev[characterName] ?? {}
      const alreadyThisDifficulty = current[bossName] === difficulty

      if (alreadyThisDifficulty) {
        // 같은 걸 다시 누르면 선택 해제
        const next = { ...current }
        delete next[bossName]
        return { ...prev, [characterName]: next }
      }

      const isNewBoss = !(bossName in current)
      if (isNewBoss && Object.keys(current).length >= WEEKLY_BOSS_LIMIT) {
        // 이미 12마리 다 찼는데 새 보스를 추가하려는 경우 - 무시
        return prev
      }

      return { ...prev, [characterName]: { ...current, [bossName]: difficulty } }
    })
  }

  return { selectedCount, atLimit, isSelected, hasAnySelection, toggle, limit: WEEKLY_BOSS_LIMIT }
}
