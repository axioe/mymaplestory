import { Fragment, useState } from 'react'
import {
  resolveBossCycle,
  resolveBossPrice,
  formatMeso,
  getValidBossContents,
  getDailyBossItems,
  getRegionBossItems,
  WEEKLY_REGIONS,
} from '../../../utils/bossHelpers.js'
import { useBossSelectionContext } from '../../../context/BossSelectionContext.jsx'
import '../../../css/home-shared.css'
import '../../../css/home-archive.css'

/**
 * 보스 목록 - 같은 보스 이름 아래 난이도별로 묶어서, 난이도는 라디오 버튼처럼
 * 하나만 고를 수 있게 한다(같은 보스를 여러 난이도로 중복해서 잡을 일은 없으니까).
 * 선택된 난이도 옆에는 인원수(1~6명) 선택이 나타나고, 결정석 가격은 인원수만큼
 * 나눠서 받으므로(가격/인원수) 그 기준으로 계산해서 보여준다.
 *
 * 지역(메이플월드/아케인/그란디스) 페이지에는 월간 보스(검은 마법사 등)도 그
 * 지역에 속하면 같이 섞여서 나온다. 다만 주간 처치 가능 횟수(12) 제한은
 * 실제로 "주간" 항목에만 적용돼야 하므로, 페이지 단위가 아니라 항목 하나하나의
 * 실제 cycle(resolveBossCycle)로 판단한다.
 */
function BossGroupList({ items, isSelected, hasAnySelection, isAtLimitFor, onToggle, getPartySize, onSetPartySize, maxPartySize }) {
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
    <div className="home__scheduler-list">
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
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
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
 * 일일/주간 보스 통계 한 그룹 - 기본은 접혀있고, 옆의 세모(▸/▾)를 누르면
 * 보스별 상세 목록이 펼쳐진다. 항목이 없으면 펼쳐도 보여줄 게 없으니 세모
 * 버튼을 비활성화한다.
 */
function BossStatsGroup({ title, entries, subtotal }) {
  const [expanded, setExpanded] = useState(false)
  const hasEntries = entries.length > 0

  return (
    <div className="home__boss-stats-group">
      <button
        type="button"
        className="home__boss-stats-group-title"
        onClick={() => hasEntries && setExpanded((v) => !v)}
        disabled={!hasEntries}
      >
        <span className="home__boss-stats-group-title-left">
          {hasEntries && (
            <span className={'home__boss-stats-caret' + (expanded ? ' home__boss-stats-caret--open' : '')}>▸</span>
          )}
          {title}
        </span>
        <span className="home__boss-stats-group-subtotal">{formatMeso(subtotal)}</span>
      </button>
      {!hasEntries && <p className="home__select-hint">선택한 보스가 없어요.</p>}
      {hasEntries && expanded && (
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
      )}
    </div>
  )
}

/**
 * 선택한 보스들의 (가격/인원수) 합계를 일일/주간(+월간)으로 나눠서 보여준다.
 * items에는 항상 "전체" 보스 목록을 넘긴다 - 지금 어느 페이지(일일/지역별)를
 * 보고 있든 상관없이 지금까지 선택한 모든 보스의 합계를 보여줘야 하기 때문이다.
 */
function BossStatsPanel({ items, bossSelection }) {
  const dailyEntries = []
  const weeklyEntries = [] // 주간 + 월간(검은 마법사 등)을 같이 묶어서 보여준다.

  for (const item of items) {
    if (bossSelection.isSelected(item.contentName, item.difficulty)) {
      const price = resolveBossPrice(item)
      const partySize = bossSelection.getPartySize(item.contentName)
      const perPerson = price != null ? price / partySize : null
      const entry = { bossName: item.contentName, difficulty: item.difficulty, partySize, perPerson }
      if (resolveBossCycle(item) === 'daily') {
        dailyEntries.push(entry)
      } else {
        weeklyEntries.push(entry)
      }
    }
  }

  const dailyTotal = dailyEntries.reduce((sum, e) => sum + (e.perPerson ?? 0), 0)
  const weeklyTotal = weeklyEntries.reduce((sum, e) => sum + (e.perPerson ?? 0), 0)
  const grandTotal = dailyTotal + weeklyTotal
  const isEmpty = dailyEntries.length === 0 && weeklyEntries.length === 0

  return (
    <div className="home__boss-stats">
      <p className="home__boss-stats-title">선택한 보스 메소 합계</p>
      {isEmpty ? (
        <p className="home__select-hint">아직 선택한 보스가 없어요.</p>
      ) : (
        <>
          <BossStatsGroup title="일일 보스" entries={dailyEntries} subtotal={dailyTotal} />
          <BossStatsGroup title="주간 보스" entries={weeklyEntries} subtotal={weeklyTotal} />
          <div className="home__boss-stats-total">
            <span>전체 합계</span>
            <span>{formatMeso(grandTotal)}</span>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * pageKind: 'daily' | 'maple' | 'arcane' | 'grandis'
 * 각 pageKind에 맞는 보스 목록과 제목을 계산해준다.
 */
function resolvePageItemsAndLabel(pageKind, scheduler) {
  if (pageKind === 'daily') {
    return { items: getDailyBossItems(scheduler), label: '일일 보스' }
  }
  const region = WEEKLY_REGIONS.find((r) => r.key === pageKind)
  return { items: getRegionBossItems(scheduler, pageKind), label: region?.label ?? '주간 보스' }
}

/**
 * 일일/지역별 선택 현황 문구. 주간(지역) 페이지는 전체 주간 선택 개수 기준으로
 * 12마리 한도를 보여주고(지역별로 따로 세지 않음), 일일은 한도가 없다.
 */
function selectionSummaryText(pageKind, bossSelection) {
  if (pageKind === 'daily') {
    return '일일 보스는 선택 개수 제한이 없어요'
  }
  return `주간 선택 ${bossSelection.weeklySelectedCount}/${bossSelection.limit} (전체 지역 합산, 월간 보스 제외)`
}

/**
 * "주간 보스" 개요 페이지 - 예전엔 여기서 바로 보스 목록을 보여줬는데, 이제는
 * 지역(메이플월드/아케인/그란디스) 버튼 3개만 보여주고, 버튼을 누르면 그
 * 지역의 선택/통계 페이지로 진짜 책장 넘김을 통해 들어간다.
 */
export function BossWeeklyOverviewPage({ scheduler, onNavigateRegion, onBack }) {
  const bossSelection = useBossSelectionContext()
  const regionCounts = WEEKLY_REGIONS.map((r) => ({
    ...r,
    count: getRegionBossItems(scheduler, r.key).length,
  }))

  return (
    <>
      <div className="home__level-content">
        <h2 className="display home__select-title">주간 보스</h2>
        <p className="home__select-hint">
          {scheduler?.characterName} · {scheduler?.worldName} · 주간 선택 {bossSelection.weeklySelectedCount}/
          {bossSelection.limit}마리
        </p>
        <div className="home__scheduler-nav">
          {regionCounts.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => onNavigateRegion(r.key)}
              className="home__scheduler-nav-button home__scheduler-nav-button--boss"
            >
              {r.label}
              <span className="home__scheduler-nav-count">{r.count}</span>
            </button>
          ))}
        </div>
        {bossSelection.selectedCount > 0 && (
          <button type="button" onClick={bossSelection.reset} className="home__boss-reset">
            선택 초기화
          </button>
        )}
      </div>

      <button onClick={onBack} className="home__archive-back home__archive-back--standalone home__archive-back--boss">
        ← 보스로
      </button>
    </>
  )
}

/**
 * 왼쪽 페이지 - 보스 선택 목록. BookFlipStage의 renderLeftPageContent가
 * boss-daily / boss-weekly-maple 등 페이지의 "짝(왼쪽) 페이지"에 이 내용을
 * 얹어준다 (다른 페이지들처럼 빈 페이지로 두지 않고).
 */
export function BossSelectionPage({ pageKind, scheduler }) {
  const bossSelection = useBossSelectionContext()
  const { items, label } = resolvePageItemsAndLabel(pageKind, scheduler)

  return (
    <div className="home__level-content home__level-content--left">
      <h2 className="display home__select-title">{label}</h2>
      <p className="home__select-hint">{selectionSummaryText(pageKind, bossSelection)}</p>
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
 * 오른쪽 페이지 - 메소 합계 통계(전체 합산) + 뒤로가기. BookFlipStage 안의
 * <Page>에 그대로 얹히는 "내용물"이다. 아카이브/개요 페이지에서 버튼을 누르면
 * 여기로 실제 책장 넘김을 통해 들어온다.
 * onBack의 목적지는 pageKind에 따라 다르다 - 일일은 아카이브(보스 개요)로,
 * 지역 페이지는 "주간 보스" 개요 페이지로 돌아간다 (Home.jsx에서 결정).
 */
export default function BossDetailPage({ pageKind, scheduler, onBack, backLabel }) {
  const bossSelection = useBossSelectionContext()
  const { label } = resolvePageItemsAndLabel(pageKind, scheduler)
  const allItems = getValidBossContents(scheduler)

  return (
    <>
      <div className="home__level-content home__level-content--stats">
        <h2 className="display home__select-title">{label} 통계</h2>

        <p className="home__select-hint">
          {selectionSummaryText(pageKind, bossSelection)}
          {bossSelection.selectedCount > 0 && (
            <button type="button" onClick={bossSelection.reset} className="home__boss-reset home__boss-reset--inline">
              초기화
            </button>
          )}
        </p>

        {/* 지금 보고 있는 페이지의 항목이 아니라 전체(allItems)를 넘겨서,
            어느 페이지에서 선택했든 항상 전체 합계가 보이도록 한다. */}
        <BossStatsPanel items={allItems} bossSelection={bossSelection} />
      </div>

      <button onClick={onBack} className="home__archive-back home__archive-back--standalone home__archive-back--boss">
        {backLabel ?? '← 보스로'}
      </button>
    </>
  )
}
