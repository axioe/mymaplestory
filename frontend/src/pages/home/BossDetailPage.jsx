import DateTimeLabel from '../../components/DateTimeLabel.jsx'
import { resolveBossCycle, resolveBossPrice, formatMeso, getValidBossContents } from '../../utils/bossHelpers.js'
import '../../css/home-shared.css'
import '../../css/home-archive.css'

const CYCLE_LABEL = { daily: '일일 보스', weekly: '주간 보스', monthly: '월간 보스' }

/**
 * 보스 목록 - 같은 보스 이름 아래 난이도별로 묶어서, 난이도는 라디오 버튼처럼
 * 하나만 고를 수 있게 한다(같은 보스를 여러 난이도로 중복해서 잡을 일은 없으니까).
 * 선택된 난이도 옆에는 인원수(1~6명) 선택이 나타나고, 결정석 가격은 인원수만큼
 * 나눠서 받으므로(가격/인원수) 그 기준으로 계산해서 보여준다.
 *
 * 주간 처치 가능 횟수(12) 제한은 "주간 보스"에만 적용된다 - 일일/월간 보스는
 * 몇 개를 고르든 제한이 없다. cycle을 넘겨서 bossSelection이 알맞게 판단하게 한다.
 */
function BossGroupList({ items, cycle, isSelected, hasAnySelection, isAtLimitFor, onToggle, getPartySize, onSetPartySize, maxPartySize }) {
  if (!items || items.length === 0) {
    return <p className="home__select-hint">표시할 항목이 없어요.</p>
  }

  const groups = new Map()
  for (const item of items) {
    if (!groups.has(item.contentName)) groups.set(item.contentName, [])
    groups.get(item.contentName).push(item)
  }

  return (
    <div className="home__scheduler-list">
      {[...groups.entries()].map(([bossName, difficulties]) => {
        const selected = hasAnySelection(bossName)
        const disableNew = isAtLimitFor(cycle) && !selected
        const partySize = getPartySize(bossName)

        return (
          <div key={bossName} className="home__boss-group">
            <p className="home__boss-group-name">{bossName}</p>
            <div className="home__boss-difficulty-row">
              {difficulties.map((d) => {
                const checked = isSelected(bossName, d.difficulty)
                const price = resolveBossPrice(d)
                const perPersonLabel = checked && price != null ? formatMeso(price / partySize) : formatMeso(price)
                return (
                  <label
                    key={d.difficulty}
                    className={'home__boss-difficulty-option' + (checked ? ' home__boss-difficulty-option--checked' : '')}
                  >
                    <input
                      type="radio"
                      name={`boss-${bossName}`}
                      checked={checked}
                      onChange={() => {}}
                      onClick={() => onToggle(bossName, d.difficulty, cycle)}
                      disabled={disableNew && !checked}
                    />
                    <span>
                      {d.difficulty}
                      {perPersonLabel && <span className="home__boss-difficulty-price">{perPersonLabel}</span>}
                    </span>
                  </label>
                )
              })}
            </div>

            {selected && (
              <div className="home__boss-party-row">
                <span className="home__boss-party-label">인원수</span>
                <select
                  value={partySize}
                  onChange={(e) => onSetPartySize(bossName, Number(e.target.value))}
                  className="home__boss-party-select"
                >
                  {Array.from({ length: maxPartySize }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}명
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * 선택한 보스들의 (가격/인원수) 합계를 보여주는 통계 패널.
 */
function BossStatsPanel({ items, bossSelection }) {
  const entries = []
  for (const item of items) {
    if (bossSelection.isSelected(item.contentName, item.difficulty)) {
      const price = resolveBossPrice(item)
      const partySize = bossSelection.getPartySize(item.contentName)
      const perPerson = price != null ? price / partySize : null
      entries.push({
        bossName: item.contentName,
        difficulty: item.difficulty,
        partySize,
        perPerson,
      })
    }
  }
  const total = entries.reduce((sum, e) => sum + (e.perPerson ?? 0), 0)

  return (
    <div className="home__boss-stats">
      <p className="home__boss-stats-title">선택한 보스 메소 합계</p>
      {entries.length === 0 ? (
        <p className="home__select-hint">아직 선택한 보스가 없어요.</p>
      ) : (
        <>
          <div className="home__boss-stats-list">
            {entries.map((e) => (
              <div key={e.bossName} className="home__boss-stats-row">
                <span className="home__boss-stats-row-name">
                  {e.bossName} ({e.difficulty}) · {e.partySize}명
                </span>
                <span className="home__boss-stats-row-value">
                  {e.perPerson != null ? formatMeso(e.perPerson) : '-'}
                </span>
              </div>
            ))}
          </div>
          <div className="home__boss-stats-total">
            <span>합계</span>
            <span>{formatMeso(total)}</span>
          </div>
        </>
      )}
    </div>
  )
}

function getCycleItems(cycle, scheduler) {
  const bossContents = getValidBossContents(scheduler)
  return bossContents.filter((b) => resolveBossCycle(b) === cycle)
}

/**
 * 일일/주간/월간에 따라 다른 선택 현황 문구를 만든다.
 * 주간 보스만 12마리 한도가 있어서, 그 경우에만 "X/12" 형태로 보여주고
 * 일일/월간은 한도가 없으니 그냥 선택한 개수만 보여준다.
 */
function selectionSummaryText(cycle, bossSelection) {
  if (cycle === 'weekly') {
    return `주간 선택 ${bossSelection.weeklySelectedCount}/${bossSelection.limit}`
  }
  const cycleLabel = cycle === 'daily' ? '일일' : '월간'
  return `${cycleLabel} 보스는 선택 개수 제한이 없어요`
}

/**
 * 왼쪽 페이지 - 보스 선택 목록. BookFlipStage의 renderLeftPageContent가
 * boss-daily/weekly/monthly 페이지의 "짝(왼쪽) 페이지"에 이 내용을 얹어준다
 * (다른 페이지들처럼 빈 페이지로 두지 않고).
 */
export function BossSelectionPage({ cycle, scheduler, bossSelection }) {
  const items = getCycleItems(cycle, scheduler)
  return (
    <div className="home__level-content home__level-content--left">
      <h2 className="display home__select-title">{CYCLE_LABEL[cycle]}</h2>
      <p className="home__select-hint">{selectionSummaryText(cycle, bossSelection)}</p>
      <BossGroupList
        items={items}
        cycle={cycle}
        isSelected={bossSelection.isSelected}
        hasAnySelection={bossSelection.hasAnySelection}
        isAtLimitFor={bossSelection.isAtLimitFor}
        onToggle={bossSelection.toggle}
        getPartySize={bossSelection.getPartySize}
        onSetPartySize={bossSelection.setPartySize}
        maxPartySize={bossSelection.maxPartySize}
      />
    </div>
  )
}

/**
 * 오른쪽 페이지 - 메소 합계 통계 + 뒤로가기. BookFlipStage 안의 <Page>에
 * 그대로 얹히는 "내용물"이다. 아카이브 페이지(보스 개요)에서 버튼을 누르면
 * 여기로 실제 책장 넘김을 통해 들어온다 (Home.jsx의 flipTo('boss-daily') 등).
 */
export default function BossDetailPage({ cycle, scheduler, bossSelection, onBack }) {
  const items = getCycleItems(cycle, scheduler)

  return (
    <>
      <div className="home__result-datetime">
        <DateTimeLabel />
      </div>

      <div className="home__level-content">
        <h2 className="display home__select-title">{CYCLE_LABEL[cycle]} 통계</h2>

        <p className="home__select-hint">
          {selectionSummaryText(cycle, bossSelection)}
          {bossSelection.selectedCount > 0 && (
            <button type="button" onClick={bossSelection.reset} className="home__boss-reset home__boss-reset--inline">
              초기화
            </button>
          )}
        </p>

        <BossStatsPanel items={items} bossSelection={bossSelection} />
      </div>

      <button onClick={onBack} className="home__archive-back home__archive-back--standalone">
        ← 보스로
      </button>
    </>
  )
}
