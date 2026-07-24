import { useRef, useState } from 'react'
import CharacterSummaryCard from '../../components/CharacterSummaryCard.jsx'
import { downloadNodeAsJpeg } from '../../utils/downloadImage.js'
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
  const captureRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(null)

  const handleDownload = async () => {
    if (!captureRef.current || downloading) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const filename = `${character?.nickname || 'maplestory-character'}_카드.jpg`
      await downloadNodeAsJpeg(captureRef.current, filename)
    } catch {
      setDownloadError('이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="home__card-content">
      {loading && <p>캐릭터 정보를 불러오는 중...</p>}
      {error && <p className="home__apikey-error">{error}</p>}

      {!loading && !error && character && (
        <>
          {/* captureRef로 감싼 영역만 JPG로 캡쳐한다 - 이 카드만 딱 잘려서 저장됨 */}
          <div ref={captureRef} className="home__card-capture">
            <CharacterSummaryCard character={character} />
          </div>

          <button onClick={handleDownload} className="home__card-download" disabled={downloading}>
            {downloading ? '저장 중...' : 'JPG로 저장'}
          </button>
          {downloadError && <p className="home__apikey-error">{downloadError}</p>}
        </>
      )}

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
