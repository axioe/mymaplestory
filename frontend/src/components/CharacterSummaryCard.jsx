import MapleLeafIcon from './MapleLeafIcon.jsx'
import '../css/character-summary-card.css'

/**
 * 캐릭터 정보 카드.
 * - bare=false(기본): 어두운 배경 카드 형태 (독립적으로 배치될 때)
 * - bare=true: 테두리/배경 없이 내용만 표시 (책 페이지 안에 바로 얹을 때)
 */
const MOCK_CHARACTER = {
  nickname: 'axioe15',
  worldName: '베라',
  level: 293,
  jobName: '소울마스터',
  popularity: 135,
  guildName: '밍밍',
  imageUrl: null,
}

export default function CharacterSummaryCard({ character = MOCK_CHARACTER, bare = false }) {
  const { nickname, worldName, level, jobName, popularity, guildName, imageUrl } = character

  return (
    <div className={bare ? 'char-card char-card--bare' : 'char-card'}>
      {!bare && <div className="char-card__badge">MY MAPLESTORY</div>}

      <div className="char-card__portrait">
        {imageUrl ? (
          <img src={imageUrl} alt={nickname} className="char-card__portrait-img" />
        ) : (
          <MapleLeafIcon size={48} color="var(--char-card-accent)" />
        )}
      </div>

      <p className="char-card__nickname">{nickname}</p>

      <p className="char-card__line">
        <span>{worldName}</span>
        <span className="char-card__dot">ㅣ</span>
        <span>Lv.{level}</span>
        <span className="char-card__dot">ㅣ</span>
        <span>{jobName}</span>
      </p>

      <p className="char-card__line char-card__line--stats">
        인기도 <strong>{popularity}</strong>
        <span className="char-card__gap" />
        길드 <strong>{guildName || '없음'}</strong>
      </p>
    </div>
  )
}
