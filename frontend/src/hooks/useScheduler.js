import { useEffect, useState } from 'react'
import { fetchScheduler } from '../api/client.js'
import { describeApiError } from '../utils/apiError.js'

export function useScheduler(enabled, characterName) {
  const [scheduler, setScheduler] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchScheduler(characterName)
      .then((data) => {
        if (!cancelled) setScheduler(data)
      })
      .catch((err) => {
        if (!cancelled) setError(describeApiError(err, '스케줄러 정보를 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, characterName])

  return { scheduler, loading, error }
}
