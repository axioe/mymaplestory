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
    Promise.all([
      fetchUnion(characterName),
      fetchUnionRaider(characterName),
      fetchUnionArtifact(characterName),
      fetchUnionChampion(characterName),
    ])
      .then(([unionData, raiderData, artifactData, championData]) => {
        if (cancelled) return
        setUnion(unionData)
        setRaider(raiderData)
        setArtifact(artifactData)
        setChampion(championData)
      })
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
