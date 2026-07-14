import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchCharacterCard } from '../api/client.js'
import '../css/character-search.css'

export default function CharacterCard() {
  const { name } = useParams()
  const [card, setCard] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchCharacterCard(name)
      .then((data) => { if (!cancelled) setCard(data) })
      .catch(() => { if (!cancelled) setError('캐릭터 정보를 불러오지 못했습니다.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [name])

  return (
    <section className="character-card-page">
      <Link to="/" className="character-card-page__back">← 다시 검색하기</Link>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="character-card-page__error">{error}</p>}

      {card && (
        <div className="character-card">
          {card.characterImage && (
            <img className="character-card__image" src={card.characterImage} alt={card.characterName} />
          )}
          <h2 className="display character-card__name">{card.characterName}</h2>
          <dl className="character-card__stats">
            <dt>레벨</dt><dd>{card.characterLevel}</dd>
            <dt>월드</dt><dd>{card.worldName}</dd>
            <dt>직업</dt><dd>{card.characterClass}</dd>
            <dt>인기도</dt><dd>{card.popularity ?? '-'}</dd>
          </dl>
        </div>
      )}
    </section>
  )
}
