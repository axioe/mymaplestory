import { useEffect, useRef, useState } from 'react'
import { fetchCharacterCard } from '../api/client.js'
import { describeApiError } from '../utils/apiError.js'

/**
 * 캐릭터가 선택되는 즉시(페이지 넘김 애니메이션이 도는 동안) 미리 카드 데이터를 불러온다.
 *
 * 캐릭터를 새로 추가할 때는 이미 한 번 조회한 데이터가 있는데, 그 조회 직후
 * selectedCharacter가 바뀌면서 이 훅의 useEffect가 "또" 자동으로 조회를 시작해서
 * 같은 캐릭터를 거의 동시에 두 번 조회하는 경합(race condition)이 있었다.
 * 두 요청 중 하나라도 실패하면(네트워크 지연 등) 이미 데이터가 있는데도
 * 에러 문구가 떠버리는 문제였음.
 *
 * loadedForRef로 "지금 cardData가 어떤 캐릭터 것인지"를 기억해두고,
 * selectedCharacter가 이미 그 캐릭터와 같으면 자동 조회를 건너뛴다.
 * setCardData(name, data)로 외부에서 미리 캐싱하면서 동시에 이 표시도 남긴다.
 */
export function useCharacterCardData(enabled, selectedCharacter) {
  const [cardData, setCardDataState] = useState(null)
  const [cardLoading, setCardLoading] = useState(false)
  const [cardError, setCardError] = useState(null)
  const loadedForRef = useRef(null)

  // 캐릭터 선택 자체가 풀리면(다른 캐릭터 선택 화면으로 돌아가는 등) 캐시 표시도 같이
  // 지운다. enabled(card/archive 페이지를 보고 있는지)가 아니라 selectedCharacter로
  // 판단해야 한다 - enabled는 페이지 이동만으로도 꺼지는데(예: card -> boss-daily),
  // 그때마다 지워버리면 캐릭터는 그대로인데도 card/archive로 돌아올 때마다 이미 있는
  // 카드 정보를 매번 재조회했다(넥슨 API 호출 제한에 불리).
  useEffect(() => {
    if (!selectedCharacter) {
      loadedForRef.current = null
    }
  }, [selectedCharacter])

  useEffect(() => {
    if (!enabled) return
    if (loadedForRef.current === selectedCharacter) return // 이미 이 캐릭터 데이터를 갖고 있음

    let cancelled = false
    setCardLoading(true)
    setCardError(null)
    fetchCharacterCard(selectedCharacter)
      .then((data) => {
        if (!cancelled) {
          loadedForRef.current = selectedCharacter
          setCardDataState(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCardError(
            describeApiError(err, '캐릭터 정보를 불러오지 못했습니다. 닉네임이나 API 키를 확인해주세요.')
          )
        }
      })
      .finally(() => {
        if (!cancelled) setCardLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, selectedCharacter])

  /** 이미 조회해둔 데이터를 외부(캐릭터 추가 직후 등)에서 바로 채워넣을 때 쓴다. */
  const setCardData = (name, data) => {
    loadedForRef.current = name
    setCardError(null)
    setCardDataState(data)
  }

  return { cardData, setCardData, cardLoading, cardError, setCardError }
}
