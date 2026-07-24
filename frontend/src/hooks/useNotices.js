import { useEffect, useState } from 'react'
import { fetchNotices, fetchEventNotices } from '../api/client.js'

/**
 * type: 'event' | 'notice'
 * enabled가 true일 때만(아카이브에서 해당 카테고리를 보고 있을 때) 조회한다.
 */
export function useNotices(enabled, type) {
  const [notices, setNotices] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)

    const fetcher = type === 'event' ? fetchEventNotices : fetchNotices
    fetcher()
      .then((data) => {
        if (!cancelled) setNotices(data)
      })
      .catch(() => {
        if (!cancelled) setError('불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, type])

  return { notices, loading, error }
}
