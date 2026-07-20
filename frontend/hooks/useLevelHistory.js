import { useEffect, useState } from 'react'
import { fetchLevelHistory } from '../api/client.js'

/**
 * enabled가 true일 때만(아카이브에서 "레벨" 카테고리를 보고 있을 때) 조회한다.
 */
export function useLevelHistory(enabled, characterName, days = 14) {
  const [levelHistory, setLevelHistory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchLevelHistory(characterName, days)
      .then((data) => {
        if (!cancelled) setLevelHistory(data)
      })
      .catch(() => {
        if (!cancelled) setError('레벨 히스토리를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, characterName, days])

  return { levelHistory, loading, error }
}
