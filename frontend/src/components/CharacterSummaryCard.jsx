import MapleLeafIcon from './MapleLeafIcon.jsx'
import '../css/character-summary-card.css'

/**
 * 캐릭터 정보 카드 - "모험 일지" 세계관에 맞춘 증서/신분증 스타일.
 * - bare=false(기본): 리본 배지 + 이중 테두리 + 레벨 스탬프가 있는 완성형 카드
 * - bare=true: 장식 없이 내용만 (책 페이지 안에 바로 얹을 때 등 다른 프레임 안에 넣을 경우)
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

      <div className="char-card__portrait-wrap">
        <div className="char-card__portrait">
          {imageUrl ? (
            <img src={imageUrl} alt={nickname} className="char-card__portrait-img" />
          ) : (
            <MapleLeafIcon size={80} color="var(--char-card-accent)" />
          )}
        </div>
        {!bare && <span className="char-card__level-stamp">Lv.{level}</span>}
      </div>

      <p className="char-card__nickname">{nickname}</p>
      <p className="char-card__subtitle">
        {worldName} <span className="char-card__subtitle-sep">·</span> {jobName}
        {bare && <> <span className="char-card__subtitle-sep">·</span> Lv.{level}</>}
      </p>

      <div className="char-card__divider" aria-hidden="true">
        <span />
        <i />
        <span />
      </div>

      <div className="char-card__stats">
        <div className="char-card__stat">
          <span className="char-card__stat-label">인기도</span>
          <span className="char-card__stat-value">{popularity ?? '-'}</span>
        </div>
        <div className="char-card__stat-divider" />
        <div className="char-card__stat">
          <span className="char-card__stat-label">길드</span>
          <span className="char-card__stat-value">{guildName || '없음'}</span>
        </div>
      </div>
    </div>
  )
}
