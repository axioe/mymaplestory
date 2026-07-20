import { useEffect, useState } from 'react'
import { fetchCharacterCard } from '../api/client.js'

/**
 * 캐릭터가 선택되는 즉시(페이지 넘김 애니메이션이 도는 동안) 미리 카드 데이터를 불러온다.
 * setCardData를 함께 내보내서, 캐릭터 추가 시점에 이미 조회해둔 데이터를 바로 채워넣어
 * 중복 조회를 줄일 수 있게 한다.
 */
export function useCharacterCardData(hasSelectedCharacter, selectedCharacter) {
  const [cardData, setCardData] = useState(null)
  const [cardLoading, setCardLoading] = useState(false)
  const [cardError, setCardError] = useState(null)

  useEffect(() => {
    if (!hasSelectedCharacter) return
    let cancelled = false
    setCardLoading(true)
    setCardError(null)
    fetchCharacterCard(selectedCharacter)
      .then((data) => {
        if (!cancelled) setCardData(data)
      })
      .catch(() => {
        if (!cancelled) setCardError('캐릭터 정보를 불러오지 못했습니다. 닉네임이나 API 키를 확인해주세요.')
      })
      .finally(() => {
        if (!cancelled) setCardLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [hasSelectedCharacter, selectedCharacter])

  return { cardData, setCardData, cardLoading, cardError, setCardError }
}
