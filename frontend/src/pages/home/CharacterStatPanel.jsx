import { useState } from 'react'

/**
 * 넥슨이 내려주는 수십 개의 스탯 중, 실제로 캐릭터 파워를 가늠할 때 가장 먼저
 * 보고 싶어할 만한 항목만 골라 위에 큼직하게 보여준다. 여기 없는 이름의 스탯도
 * 데이터를 잃는 게 아니라 아래 "전체 스탯 보기"에 전부 그대로 들어간다 -
 * 이 목록은 순전히 "먼저 보여줄 순서"를 정하는 용도라, 넥슨 쪽 표기가 살짝
 * 달라도(예: 다른 시즌/직업에서 이름이 바뀌어도) 기능이 깨지지 않는다.
 */
const HEADLINE_STAT_NAMES = [
  '전투력',
  'HP',
  'MP',
  'STR',
  'DEX',
  'INT',
  'LUK',
  '공격력',
  '마력',
  '보스 몬스터 데미지',
  '데미지',
  '크리티컬 데미지',
  '방어율 무시',
]

/**
 * 넥슨 stat_value는 숫자든 아니든 전부 문자열로 내려온다 - 그중 순수 정수처럼
 * 보이는 값만 천 단위 구분 쉼표를 넣어 읽기 쉽게 하고, 나머지("125.00" 같은
 * 퍼센트나 이미 포맷된 값)는 그대로 둔다.
 */
function formatStatValue(value) {
  if (value == null) return '-'
  return /^\d+$/.test(value) ? Number(value).toLocaleString('ko-KR') : value
}

export default function CharacterStatPanel({ characterStat }) {
  const [expanded, setExpanded] = useState(false)
  const stats = characterStat?.stats ?? []

  if (stats.length === 0) {
    return <p className="home__select-hint">능력치 정보를 찾을 수 없어요.</p>
  }

  const headline = HEADLINE_STAT_NAMES
    .map((name) => stats.find((s) => s.name === name))
    .filter(Boolean)
  const headlineNames = new Set(headline.map((s) => s.name))
  const rest = stats.filter((s) => !headlineNames.has(s.name))

  return (
    <div className="home__stat-panel">
      {characterStat.characterClass && (
        <p className="home__select-hint">{characterStat.characterClass}</p>
      )}

      <div className="home__stat-grid">
        {headline.map((s) => (
          <div key={s.name} className={'home__stat-card' + (s.name === '전투력' ? ' home__stat-card--power' : '')}>
            <span className="home__stat-card-label">{s.name}</span>
            <span className="home__stat-card-value">{formatStatValue(s.value)}</span>
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="home__stat-more">
          <button type="button" className="home__stat-more-toggle" onClick={() => setExpanded((v) => !v)}>
            <span className={'home__stat-more-caret' + (expanded ? ' home__stat-more-caret--open' : '')}>▸</span>
            전체 스탯 보기 ({rest.length})
          </button>
          {expanded && (
            <div className="home__stat-more-list">
              {rest.map((s) => (
                <div key={s.name} className="home__stat-more-row">
                  <span className="home__stat-more-row-name">{s.name}</span>
                  <span className="home__stat-more-row-value">{formatStatValue(s.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
