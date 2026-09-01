import { Fragment, useState } from 'react'
import {
  resolveBossCycle,
  resolveBossPrice,
  formatMeso,
  getValidBossContents,
  getDailyBossItems,
  getWeeklyLikeBossItems,
} from '../../../utils/bossHelpers.js'
import { useBossSelectionContext } from '../../../context/BossSelectionContext.jsx'
import { useBossClearTracker } from '../../../hooks/useBossClearTracker.js'
import '../../../css/home-shared.css'
import '../../../css/home-archive-shared.css'
import '../../../css/home-boss.css'

const BOSS_GROUPS_PER_PAGE = 3

/**
 * 보스 목록 - 같은 보스 이름 아래 난이도별로 묶어서, 난이도는 라디오 버튼처럼
 * 하나만 고를 수 있게 한다(같은 보스를 여러 난이도로 중복해서 잡을 일은 없으니까).
 * 선택된 난이도 옆에는 인원수(1~6명) 선택이 나타나고, 결정석 가격은 인원수만큼
 * 나눠서 받으므로(가격/인원수) 그 기준으로 계산해서 보여준다.
 *
 * 주간 보스는 여러 지역 보스가 한 목록에 다 섞여 있어서 항목이 많다. 예전엔
 * 마우스 휠로 내려서 봐야 했는데(내부 스크롤), 페이지로 끊어서 보여주고
 * 하단에 이전/다음 버튼을 두는 방식으로 바꿨다. 한 번에 3개씩만 보여줘서
 * 스크롤 없이 한눈에 들어오게 한다(4개였을 때도 난이도/인원수 선택까지 펼쳐지면
 * 한 페이지 안에서 아래쪽이 페이지 밖으로 밀려나 보이는 문제가 있었다). 월간
 * 보스(검은 마법사 등) 그룹은 여전히 맨 뒤로 보내고, 그 경계가 있는
 * 페이지에서만 구분선을 보여준다.
 */
function BossGroupList({
  items,
  isSelected,
  hasAnySelection,
  isAtLimitFor,
  onToggle,
  getPartySize,
  onSetPartySize,
  maxPartySize,
  isCleared,
  onToggleCleared,
}) {
  const [page, setPage] = useState(0)

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

  // 목록 길이가 바뀌어서(예: 데이터가 늦게 도착) 지금 페이지가 범위를 벗어나면
  // 자동으로 보정한다 - 별도 reset useEffect 없이 렌더링 시점에 바로 clamp한다.
  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / BOSS_GROUPS_PER_PAGE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageEntries = sortedEntries.slice(
    currentPage * BOSS_GROUPS_PER_PAGE,
    currentPage * BOSS_GROUPS_PER_PAGE + BOSS_GROUPS_PER_PAGE
  )

  return (
    <>
      <div className="home__scheduler-list home__scheduler-list--boss">
        {pageEntries.map(([bossName, difficulties], indexInPage) => {
          const index = currentPage * BOSS_GROUPS_PER_PAGE + indexInPage
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
                    const disableNew = isAtLimitFor(itemCycle, bossName) && !selected
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
                          {d.difficulty.toUpperCase()}
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

                {selected && onToggleCleared && (
                  <label className="home__boss-clear-row">
                    <input
                      type="checkbox"
                      checked={isCleared(bossName)}
                      onChange={() => onToggleCleared(bossName)}
                    />
                    <span>이번 주 완료</span>
                  </label>
                )}
              </div>
            </Fragment>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="home__boss-pagination">
          <button
            type="button"
            className="home__boss-page-button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ← 이전
          </button>
          <span className="home__boss-page-indicator">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="home__boss-page-button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            다음 →
          </button>
        </div>
      )}
    </>
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
                {e.bossName} ({e.difficulty.toUpperCase()}) · {e.partySize}명
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
 * pageKind: 'daily' | 'weekly'
 * 각 pageKind에 맞는 보스 목록과 제목을 계산해준다.
 * 예전엔 주간 보스를 지역(메이플월드/아케인/그란디스)별로 페이지를 나눠서
 * 보여줬는데, 일일/주간 두 갈래로만 나오게 해달라는 요청으로 지역 구분 없이
 * 하나의 목록으로 합쳤다.
 */
function resolvePageItemsAndLabel(pageKind, scheduler) {
  if (pageKind === 'daily') {
    return { items: getDailyBossItems(scheduler), label: '일일 보스' }
  }
  return { items: getWeeklyLikeBossItems(scheduler), label: '주간 보스' }
}

/**
 * 일일/주간 선택 현황 문구. 주간은 12마리 한도를 보여주고(시즌 보스 메이린은
 * 한도에서 제외), 일일은 한도가 없다.
 */
function selectionSummaryText(pageKind, bossSelection) {
  if (pageKind === 'daily') {
    return '일일 보스는 선택 개수 제한이 없어요'
  }
  return `주간 선택 ${bossSelection.weeklySelectedCount}/${bossSelection.limit} (월간 보스·시즌 보스 메이린 제외)`
}

/**
 * 왼쪽 페이지 - 보스 선택 목록. BookFlipStage의 renderLeftPageContent가
 * boss-daily / boss-weekly 페이지의 "짝(왼쪽) 페이지"에 이 내용을
 * 얹어준다 (다른 페이지들처럼 빈 페이지로 두지 않고).
 *
 * 제목({label})과 선택 현황 문구(selectionSummaryText)는 일부러 안 넣는다 -
 * 바로 옆(오른쪽) 페이지의 "{label} 통계"에 똑같은 제목과 문구가 이미 있어서
 * 스프레드 하나에 같은 문구가 두 번 겹쳐 보였다. 왼쪽은 목록 자체에 공간을
 * 더 내주고, 제목/현황은 오른쪽 통계 페이지가 대표해서 보여주게 했다.
 */
export function BossSelectionPage({ pageKind, scheduler, characterName }) {
  const bossSelection = useBossSelectionContext()
  const { items } = resolvePageItemsAndLabel(pageKind, scheduler)
  // 완료 체크는 주간 보스에서만 의미가 있다(넥슨 초기화 주기와 맞물린 개념이라
  // 매일 초기화되는 일일 보스에는 적용하지 않는다) - characterName이 없는
  // (=일일 페이지) 호출부에서는 훅이 빈 상태로 동작해 아무 영향이 없다.
  const bossClear = useBossClearTracker(pageKind === 'weekly' ? characterName : null)

  return (
    <div className="home__level-content home__level-content--left">
      <BossGroupList
        items={items}
        isSelected={bossSelection.isSelected}
        hasAnySelection={bossSelection.hasAnySelection}
        isAtLimitFor={bossSelection.isAtLimitFor}
        onToggle={bossSelection.toggle}
        getPartySize={bossSelection.getPartySize}
        onSetPartySize={bossSelection.setPartySize}
        maxPartySize={bossSelection.maxPartySize}
        isCleared={pageKind === 'weekly' ? bossClear.isCleared : undefined}
        onToggleCleared={pageKind === 'weekly' ? bossClear.toggleCleared : undefined}
      />
    </div>
  )
}

/**
 * 오른쪽 페이지 - 메소 합계 통계(전체 합산) + 뒤로가기. BookFlipStage 안의
 * <Page>에 그대로 얹히는 "내용물"이다. 아카이브/개요 페이지에서 버튼을 누르면
 * 여기로 실제 책장 넘김을 통해 들어온다. onBack은 일일/주간 둘 다 아카이브
 * (보스 개요)로 돌아간다 (Home.jsx에서 flipTo('archive-boss')로 연결).
 */
export default function BossDetailPage({ pageKind, scheduler, onBack }) {
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
        ← 보스로
      </button>
    </>
  )
}
