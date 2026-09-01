import { useState } from 'react'
import MergedStatList from '../../components/MergedStatList.jsx'
import { mergeUnionStatLines } from '../../utils/mergeUnionStats.js'
import '../../css/home-stat.css'

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

/**
 * 세트효과 응답(SetEffectItem[])에서, 지금 착용 개수(totalSetCount) 기준으로
 * "이미 적용된" 효과만 골라내고, 다음 단계 효과가 있으면 몇 개 더 모아야
 * 하는지도 같이 계산한다. 한 조각도 안 맞춰서 활성화된 효과가 없는 세트는
 * (착용 중이라도) 보여줄 게 없으므로 걸러낸다.
 */
function resolveActiveSets(setEffect) {
  const items = setEffect?.setEffects ?? []
  return items
    .map((item) => {
      const infos = item.setEffectInfo ?? []
      const activeInfos = infos
        .filter((i) => i.setCount <= item.totalSetCount)
        .sort((a, b) => a.setCount - b.setCount)
      const nextInfo = infos
        .filter((i) => i.setCount > item.totalSetCount)
        .sort((a, b) => a.setCount - b.setCount)[0]
      return { setName: item.setName, totalSetCount: item.totalSetCount, activeInfos, nextInfo }
    })
    .filter((item) => item.activeInfos.length > 0)
}

export default function CharacterStatPanel({ characterStat, setEffect, setEffectLoading, setEffectError }) {
  const [expanded, setExpanded] = useState(false)
  const [showSetEffect, setShowSetEffect] = useState(false)
  const stats = characterStat?.stats ?? []

  if (stats.length === 0) {
    return <p className="home__select-hint">능력치 정보를 찾을 수 없어요.</p>
  }

  const headline = HEADLINE_STAT_NAMES
    .map((name) => stats.find((s) => s.name === name))
    .filter(Boolean)
  const headlineNames = new Set(headline.map((s) => s.name))
  const rest = stats.filter((s) => !headlineNames.has(s.name))
  const activeSets = resolveActiveSets(setEffect)

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

      {/* 세트효과는 슬롯 하나가 아니라 지금 착용 중인 전체 장비 조합에서 나오는
          보너스라서, 장비 카테고리가 아니라 여기(능력치)에서 보여준다. 기본은
          접혀있고, 위 "전체 스탯 보기"와 같은 캐럿 토글 스타일로 통일한다. */}
      {setEffectLoading && <p className="home__select-hint">세트효과 불러오는 중...</p>}
      {setEffectError && <p className="home__apikey-error">{setEffectError}</p>}
      {!setEffectLoading && !setEffectError && activeSets.length > 0 && (
        <div className="home__stat-more">
          <button type="button" className="home__stat-more-toggle" onClick={() => setShowSetEffect((v) => !v)}>
            <span className={'home__stat-more-caret' + (showSetEffect ? ' home__stat-more-caret--open' : '')}>▸</span>
            세트옵션 보기
          </button>
          {showSetEffect && (
            <div className="home__stat-seteffect">
              {activeSets.map((item) => (
                <div key={item.setName} className="home__stat-seteffect-item">
                  <p className="home__stat-seteffect-name">
                    {item.setName}
                    <span className="home__stat-seteffect-count">{item.totalSetCount}세트</span>
                  </p>
                  <MergedStatList lines={mergeUnionStatLines(item.activeInfos.map((i) => i.setOption))} />
                  {item.nextInfo && (
                    <p className="home__stat-seteffect-next">{item.nextInfo.setCount}세트 달성 시 효과 추가</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
