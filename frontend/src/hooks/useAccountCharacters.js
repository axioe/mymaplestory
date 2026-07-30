import { useEffect, useState } from 'react'
import { fetchAccountCharacters } from '../api/client.js'
import { describeApiError } from '../utils/apiError.js'

export function useAccountCharacters(enabled, apiKey) {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled || !apiKey) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchAccountCharacters(apiKey)
      .then((data) => {
        if (!cancelled) setCharacters(data?.characters ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(describeApiError(err, '캐릭터 목록을 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, apiKey])

  return { characters, loading, error }
}
