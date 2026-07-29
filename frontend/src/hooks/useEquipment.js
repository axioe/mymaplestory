import { useEffect, useState } from 'react'
import { fetchEquipment } from '../api/client.js'
import { describeApiError } from '../utils/apiError.js'

export function useEquipment(enabled, characterName) {
  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchEquipment(characterName)
      .then((data) => {
        if (!cancelled) setEquipment(data)
      })
      .catch((err) => {
        if (!cancelled) setError(describeApiError(err, '장착장비 정보를 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, characterName])

  return { equipment, loading, error }
}
