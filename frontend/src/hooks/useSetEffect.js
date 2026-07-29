import { useEffect, useState } from 'react'
import { fetchSetEffect } from '../api/client.js'
import { describeApiError } from '../utils/apiError.js'

export function useSetEffect(enabled, characterName) {
  const [setEffect, setSetEffect] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchSetEffect(characterName)
      .then((data) => {
        if (!cancelled) setSetEffect(data)
      })
      .catch((err) => {
        if (!cancelled) setError(describeApiError(err, '세트효과 정보를 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, characterName])

  return { setEffect, loading, error }
}
