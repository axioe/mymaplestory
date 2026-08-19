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
    // 캐릭터를 바꿔도 새 응답이 도착하기 전까지 이전 캐릭터의 scheduler가 그대로
    // 남아있었다 - SchedulerDetailPage가 scheduler.characterName으로 스킵 기록을
    // 저장하는데, 그 짧은 순간 스킵 체크박스를 누르면 이전 캐릭터의 DB 레코드가
    // 바뀌는 버그가 있었다. 새 조회를 시작하는 시점에 바로 비워서 그 창을 없앤다.
    setScheduler(null)
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
