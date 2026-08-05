import { useRef, useState } from 'react'
import CharacterSummaryCard from '../../../components/CharacterSummaryCard.jsx'
import { downloadNodeAsJpeg } from '../../../utils/downloadImage.js'
import '../../../css/home-shared.css'
import '../../../css/home-card.css'

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
    const node = captureRef.current
    if (!node || downloading) return
    setDownloading(true)
    setDownloadError(null)
    // react-pageflip이 페이지 넘김 효과를 위해 3D transform을 계속 갖고 있는
    // .flip-page(조상 요소)를 그대로 캡쳐했더니 렌더링이 깨져서 거의 빈
    // 화면으로 찍히는 문제가 있었다. 그래서 우리가 직접 만든(transform 없는)
    // 이 div만 캡쳐하되, 평소엔 투명하게 둬서(뒤에 실제 페이지 배경이 자연스럽게
    // 비쳐 보이도록) 화면에서 이미지가 이중으로 겹쳐 보이지 않게 하고, 캡쳐하는
    // 그 순간에만 잠깐 배경 이미지를 씌웠다가 끝나면 다시 뗀다.
    node.classList.add('home__card-capture--with-bg')
    try {
      const filename = `${character?.nickname || 'maplestory-character'}_카드.jpg`
      await downloadNodeAsJpeg(node, filename, 'home__card-capture-exclude')
    } catch {
      setDownloadError('이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      node.classList.remove('home__card-capture--with-bg')
      setDownloading(false)
    }
  }

  return (
    <div className="home__card-content">
      {loading && <p>캐릭터 정보를 불러오는 중...</p>}
      {error && <p className="home__apikey-error">{error}</p>}

      {!loading && !error && character && (
        <>
          <div ref={captureRef} className="home__card-capture">
            <CharacterSummaryCard character={character} />
          </div>

          <div className="home__card-actions home__card-capture-exclude">
            <button onClick={handleDownload} className="home__card-download" disabled={downloading}>
              {downloading ? '저장 중...' : 'JPG로 저장'}
            </button>
            <button onClick={onGoArchive} aria-label="아카이브로 이동" className="home__card-next">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {downloadError && <p className="home__apikey-error home__card-capture-exclude">{downloadError}</p>}
        </>
      )}

      <div className="home__card-links home__card-capture-exclude">
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
