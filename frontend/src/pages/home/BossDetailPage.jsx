import { Fragment, useLayoutEffect, useRef } from 'react'
import DateTimeLabel from '../../components/DateTimeLabel.jsx'
import { resolveBossCycle, resolveBossPrice, formatMeso, getValidBossContents } from '../../utils/bossHelpers.js'
import '../../css/home-shared.css'
import '../../css/home-archive.css'

const CYCLE_LABEL = { daily: '일일 보스', weekly: '주간 보스' }

/**
 * 보스 목록 - 같은 보스 이름 아래 난이도별로 묶어서, 난이도는 라디오 버튼처럼
 * 하나만 고를 수 있게 한다(같은 보스를 여러 난이도로 중복해서 잡을 일은 없으니까).
 * 선택된 난이도 옆에는 인원수(1~6명) 선택이 나타나고, 결정석 가격은 인원수만큼
 * 나눠서 받으므로(가격/인원수) 그 기준으로 계산해서 보여준다.
 *
 * "주간 보스" 페이지에는 월간 보스(검은 마법사 등)도 같이 섞여서 나온다 - 월간
 * 보스만 따로 페이지/버튼을 두기엔 너무 적어서 주간 쪽에 통합했다. 다만 주간
 * 처치 가능 횟수(12) 제한은 실제로 주간인 항목에만 적용돼야 하므로, 페이지
 * 단위가 아니라 항목 하나하나의 실제 cycle(resolveBossCycle)로 판단한다.
 */
function BossGroupList({ items, isSelected, hasAnySelection, isAtLimitFor, onToggle, getPartySize, onSetPartySize, maxPartySize }) {
  const listRef = useRef(null)
  const scrollTopRef = useRef(0)

  // 원인이 뭐든(포커스, 레이아웃 변화 등) 렌더링 이후에 스크롤 위치가 흐트러지면
  // 매번 마지막으로 기억해둔 위치로 강제 복원한다. onScroll에서 사용자가 실제로
  // 스크롤한 위치를 계속 기록해두고, 렌더링이 끝날 때마다(useLayoutEffect) 그
  // 위치를 다시 적용하는 방식이라 원인을 몰라도 확실하게 막을 수 있다.
  useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = scrollTopRef.current
    }
  })

  const handleScroll = (e) => {
    scrollTopRef.current = e.currentTarget.scrollTop
  }

  if (!items || items.length === 0) {
    return <p className="home__select-hint">표시할 항목이 없어요.</p>
  }

  const groups = new Map()
  for (const item of items) {
    if (!groups.has(item.contentName)) groups.set(item.contentName, [])
    groups.get(item.contentName).push(item)
  }

  // 월간 보스(검은 마법사 등) 그룹은 맨 아래로 보내고, 그 경계에 구분선을 넣는다.
  const groupEntries = [...groups.entries()]
  const isMonthlyGroup = (difficulties) => difficulties.every((d) => resolveBossCycle(d) === 'monthly')
  const sortedEntries = [
    ...groupEntries.filter(([, difficulties]) => !isMonthlyGroup(difficulties)),
    ...groupEntries.filter(([, difficulties]) => isMonthlyGroup(difficulties)),
  ]
  const firstMonthlyIndex = sortedEntries.findIndex(([, difficulties]) => isMonthlyGroup(difficulties))

  return (
    <div className="home__scheduler-list" ref={listRef} onScroll={handleScroll}>
      {sortedEntries.map(([bossName, difficulties], index) => {
        const selected = hasAnySelection(bossName)
        const partySize = getPartySize(bossName)

        return (
          <Fragment key={bossName}>
            {index === firstMonthlyIndex && (
              <div className="home__boss-monthly-divider">
                <span>월간 보스</span>
              </div>
            )}
            <div className="home__boss-group">
              <p className="home__boss-group-name">{bossName}</p>
              <div className="home__boss-difficulty-row">
                {difficulties.map((d) => {
                  const itemCycle = resolveBossCycle(d)
                  const checked = isSelected(bossName, d.difficulty)
                  const disableNew = isAtLimitFor(itemCycle) && !selected
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
                        // 클릭할 때 라디오가 포커스를 받으면서 브라우저가 "포커스된
                        // 요소를 화면에 보이게" 스크롤을 자동으로 올려버리는 문제가
                        // 있었다. 커스텀 클릭 처리만 쓰고 네이티브 포커스는 막는다.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          // 클릭 자체로도 포커스가 걸릴 수 있는 브라우저가 있어서
                          // (mousedown 방지만으로는 부족했다), 클릭 직후 바로
                          // blur시켜서 포커스에 딸려오는 자동 스크롤을 확실히 막는다.
                          e.currentTarget.blur()
                          onToggle(bossName, d.difficulty, itemCycle)
                        }}
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
          </Fragment>
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

/**
 * cycle이 'weekly'면 월간 보스(검은 마법사 등)도 같이 포함한다 (통합 요청 반영).
 * 'daily'면 그대로 일일 보스만.
 */
function getCycleItems(cycle, scheduler) {
  const bossContents = getValidBossContents(scheduler)
  if (cycle === 'weekly') {
    return bossContents.filter((b) => {
      const c = resolveBossCycle(b)
      return c === 'weekly' || c === 'monthly'
    })
  }
  return bossContents.filter((b) => resolveBossCycle(b) === cycle)
}

/**
 * 일일/주간에 따라 다른 선택 현황 문구를 만든다. 주간 페이지는 월간 보스도 같이
 * 보여주지만, 12마리 한도는 그중 진짜 "주간" 항목에만 적용된다는 걸 알려준다.
 */
function selectionSummaryText(cycle, bossSelection) {
  if (cycle === 'weekly') {
    return `주간 선택 ${bossSelection.weeklySelectedCount}/${bossSelection.limit} (월간 보스는 한도 제외)`
  }
  return '일일 보스는 선택 개수 제한이 없어요'
}

/**
 * 왼쪽 페이지 - 보스 선택 목록. BookFlipStage의 renderLeftPageContent가
 * boss-daily/weekly 페이지의 "짝(왼쪽) 페이지"에 이 내용을 얹어준다
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
 *
 * 제목/통계를 위쪽에 붙여서(--stats 수식자) 내용이 길어져도 하단의
 * "← 보스로" 뒤로가기 버튼과 겹치지 않도록 했다.
 */
export default function BossDetailPage({ cycle, scheduler, bossSelection, onBack }) {
  const items = getCycleItems(cycle, scheduler)

  return (
    <>
      <div className="home__result-datetime">
        <DateTimeLabel />
      </div>

      <div className="home__level-content home__level-content--stats">
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
