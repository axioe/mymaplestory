import { useEffect, useState } from 'react'
import { fetchUnion, fetchUnionRaider, fetchUnionArtifact, fetchUnionChampion } from '../api/client.js'
import { describeApiError } from '../utils/apiError.js'

/**
 * 유니온 카테고리는 버튼 4개(정보/공격대/아티팩트/챔피언)로 나뉘어 있지만,
 * 버튼을 누를 때마다 새로 조회하면 매번 로딩을 기다려야 해서 UX가 끊긴다.
 * 카테고리에 들어오는 시점에 4개를 한 번에 다 받아두고, 버튼은 그중 뭘
 * 보여줄지 고르는 용도로만 쓴다.
 */
export function useUnion(enabled, characterName) {
  const [union, setUnion] = useState(null)
  const [raider, setRaider] = useState(null)
  const [artifact, setArtifact] = useState(null)
  const [champion, setChampion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    setError(null)

    // 4개를 Promise.all로 한꺼번에 쏘면 넥슨 API의 초당 호출 제한에 걸려서
    // 일부만 실패하는 문제가 있었다. 그래서 하나씩 순서대로(await) 요청한다 -
    // 살짝 느려지지만, 안정적으로 4개 다 받아오는 게 더 중요하다.
    async function loadAll() {
      const unionData = await fetchUnion(characterName)
      if (cancelled) return
      setUnion(unionData)

      const raiderData = await fetchUnionRaider(characterName)
      if (cancelled) return
      setRaider(raiderData)

      const artifactData = await fetchUnionArtifact(characterName)
      if (cancelled) return
      setArtifact(artifactData)

      const championData = await fetchUnionChampion(characterName)
      if (cancelled) return
      setChampion(championData)
    }

    loadAll()
      .catch((err) => {
        if (!cancelled) setError(describeApiError(err, '유니온 정보를 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, characterName])

  return { union, raider, artifact, champion, loading, error }
}
