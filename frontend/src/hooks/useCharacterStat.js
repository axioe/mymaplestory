import { useEffect, useState } from 'react'
import { fetchCharacterStat } from '../api/client.js'
import { describeApiError } from '../utils/apiError.js'

/**
 * enabled가 true일 때만(아카이브에서 "능력치" 카테고리를 보고 있을 때) 조회한다.
 */
export function useCharacterStat(enabled, characterName) {
  const [characterStat, setCharacterStat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchCharacterStat(characterName)
      .then((data) => {
        if (!cancelled) setCharacterStat(data)
      })
      .catch((err) => {
        if (!cancelled) setError(describeApiError(err, '능력치를 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, characterName])

  return { characterStat, loading, error }
}
