import MapleLeafIcon from './MapleLeafIcon.jsx'
import '../css/character-summary-card.css'

/**
 * API 키 인증 이후 첫 페이지에 표시하는 캐릭터 카드.
 * 지금은 프론트엔드 UI만 먼저 만드는 단계라 mock 데이터를 기본값으로 사용한다.
 * 백엔드 연동 시에는 CharacterCard 응답(basic + popularity)을 이 컴포넌트가 받는
 * `character` prop 형태로 매핑해서 넘겨주면 된다.
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

export default function CharacterSummaryCard({ character = MOCK_CHARACTER }) {
  const { nickname, worldName, level, jobName, popularity, guildName, imageUrl } = character

  return (
    <div className="char-card">
      <div className="char-card__badge">MY MAPLESTORY</div>

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
