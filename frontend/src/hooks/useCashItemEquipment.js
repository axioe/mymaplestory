import { useEffect, useState } from 'react'
import { fetchCashItemEquipment } from '../api/client.js'
import { describeApiError } from '../utils/apiError.js'

export function useCashItemEquipment(enabled, characterName) {
  const [cashItem, setCashItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchCashItemEquipment(characterName)
      .then((data) => {
        if (!cancelled) setCashItem(data)
      })
      .catch((err) => {
        if (!cancelled) setError(describeApiError(err, '캐시 장비 정보를 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, characterName])

  return { cashItem, loading, error }
}
