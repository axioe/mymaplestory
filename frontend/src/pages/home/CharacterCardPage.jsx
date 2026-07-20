import CharacterSummaryCard from '../../components/CharacterSummaryCard.jsx'
import '../../css/home-shared.css'
import '../../css/home-card.css'

function mapToCardProps(cardData) {
  if (!cardData) return null
  return {
    nickname: cardData.characterName,
    worldName: cardData.worldName,
    level: cardData.characterLevel,
    jobName: cardData.characterClass,
    popularity: cardData.popularity,
    guildName: cardData.guildName,
    imageUrl: cardData.characterImage,
  }
}

export default function CharacterCardPage({
  cardData,
  loading,
  error,
  onGoArchive,
  onBackToSelect,
  onReset,
}) {
  const character = mapToCardProps(cardData)

  return (
    <div className="home__card-content">
      {loading && <p>캐릭터 정보를 불러오는 중...</p>}
      {error && <p className="home__apikey-error">{error}</p>}
      {!loading && !error && character && <CharacterSummaryCard character={character} />}

      <button onClick={onGoArchive} aria-label="아카이브로 이동" className="home__card-next">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="home__card-links">
        <button onClick={onBackToSelect} className="home__card-link">
          다른 캐릭터 선택
        </button>
        <button onClick={onReset} className="home__card-link">
          API 키 초기화
        </button>
      </div>
    </div>
  )
}
