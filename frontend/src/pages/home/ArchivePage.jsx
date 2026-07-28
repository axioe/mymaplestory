import { useState } from 'react'
import DateTimeLabel from '../../components/DateTimeLabel.jsx'
import CategorySelector from './CategorySelector.jsx'
import { useSkipTracker } from '../../hooks/useSkipTracker.js'
import { useBossSelection } from '../../hooks/useBossSelection.js'
import '../../css/home-shared.css'
import '../../css/home-archive.css'

// quest_state: "0"=미수락, "1"=진행 중(수락함), "2"=완료
const QUEST_STATE_LABEL = { '0': '미수락', '1': '진행 중', '2': '완료' }
const QUEST_STATE_CLASS = {
  '0': '',
  '1': ' home__scheduler-item-badge--progress',
  '2': ' home__scheduler-item-badge--done',
}

/**
 * "[에픽던전] ~~~" 또는 "[에픽 던전] ~~~"처럼 대괄호/띄어쓰기가 붙는 경우가 섞여
 * 있어서, 비교 전에 공백을 다 지우고 나서 판별한다.
 */
function isEpicDungeonItem(item) {
  const normalized = (item.contentName ?? '').replace(/\s/g, '')
  return item.type !== 'quest' && normalized.includes('에픽던전')
}

function isCleared(item) {
  const now = item.nowCount ?? 0
  const max = item.maxCount ?? 0
  return max > 0 && now >= max
}

const EPIC_DUNGEON_WEEKLY_LIMIT = 2

/**
 * 항목마다 배지에 뭘 어떻게 보여줄지 결정한다.
 * - 퀘스트: 미수락/진행 중/완료
 * - "에픽던전"이 이름에 들어간 항목: contents 타입이라도 진행률(n/m) 대신 완료/미완료로
 *   표시하고, 주당 2개까지만 클리어 가능하므로 이미 2개를 완료했다면 나머지 항목은
 *   "미완료" 대신 한도 초과 안내를 보여준다.
 * - max_count가 0인 항목(예: [길드] 지하 수로): "n/0"처럼 분수로 표시하면 이상해서
 *   그냥 "n점"으로 표시
 * - 그 외 일반 contents: 기존처럼 n/m 진행률 표시
 */
function getContentDisplay(item, epicDungeonDoneCount) {
  const isQuest = item.type === 'quest'
  const now = item.nowCount ?? 0
  const max = item.maxCount ?? 0
  const cleared = isCleared(item)

  if (isQuest) {
    return {
      badgeClass: QUEST_STATE_CLASS[item.questState] ?? '',
      text: QUEST_STATE_LABEL[item.questState] ?? '미수락',
    }
  }
  if (isEpicDungeonItem(item)) {
    if (cleared) {
      return { badgeClass: ' home__scheduler-item-badge--done', text: '완료' }
    }
    if (epicDungeonDoneCount >= EPIC_DUNGEON_WEEKLY_LIMIT) {
      return { badgeClass: ' home__scheduler-item-badge--limit', text: '최대로 할 수 있는 에픽던전을 넘겼습니다' }
    }
    return { badgeClass: '', text: '미완료' }
  }
  if (max === 0) {
    return {
      badgeClass: now > 0 ? ' home__scheduler-item-badge--done' : '',
      text: `${now}점`,
    }
  }
  return {
    badgeClass: cleared ? ' home__scheduler-item-badge--done' : '',
    text: `${now}/${max}`,
  }
}

/**
 * 일일/주간 콘텐츠 목록 - 항목 이름 자체가 버튼이라 클릭하면 완료 여부가 펼쳐지고,
 * 왼쪽 체크박스는 "이건 스킵할래"라는 개인 표시(localStorage 저장, 넥슨과 무관).
 * 체크하면 그 줄 전체가 흐려지고 이름에 취소선이 그어져서 스킵 상태가 바로 보인다.
 */
function ContentButtonList({ items, isSkipped, onToggleSkip }) {
  const [expandedName, setExpandedName] = useState(null)

  if (!items || items.length === 0) {
    return <p className="home__select-hint">표시할 항목이 없어요.</p>
  }

  const epicDungeonDoneCount = items.filter((i) => isEpicDungeonItem(i) && isCleared(i)).length

  return (
    <div className="home__scheduler-list">
      {items.map((item) => {
        const { badgeClass, text } = getContentDisplay(item, epicDungeonDoneCount)
        const isExpanded = expandedName === item.contentName
        const skipped = isSkipped(item.contentName)

        return (
          <div
            key={item.contentName}
            className={'home__scheduler-item' + (skipped ? ' home__scheduler-item--skipped' : '')}
          >
            <input
              type="checkbox"
              className="home__scheduler-skip"
              checked={skipped}
              onChange={() => onToggleSkip(item.contentName)}
              aria-label={`${item.contentName} 스킵`}
            />
            <button
              type="button"
              className="home__scheduler-item-button"
              onClick={() => setExpandedName(isExpanded ? null : item.contentName)}
            >
              {item.contentName}
            </button>
            {isExpanded && (
              <span className={'home__scheduler-item-badge' + badgeClass}>{text}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * 스케줄러 콘텐츠 - 일일/주간을 동시에 다 펼쳐서 보여주면 너무 길어서,
 * "일일 콘텐츠"/"주간 콘텐츠" 버튼 두 개만 먼저 보여주고, 누른 것만 목록으로
 * 들어가는 서브 페이지 형식으로 만들었다.
 * view 상태는 부모(ArchivePage)가 들고 있다 - 하단의 "← 스케줄러로" 링크를
 * "← 캐릭터 카드로"와 나란히 보여주려면 부모가 지금 view를 알아야 하기 때문.
 */
function SchedulerSection({ scheduler, view }) {
  const { isSkipped, toggleSkip } = useSkipTracker(scheduler?.characterName)

  if (view === 'daily' || view === 'weekly') {
    const isDaily = view === 'daily'
    return (
      <>
        <p className="home__select-hint">{isDaily ? '일일 콘텐츠' : '주간 콘텐츠'}</p>
        <ContentButtonList
          items={isDaily ? scheduler.dailyContents : scheduler.weeklyContents}
          isSkipped={isSkipped}
          onToggleSkip={toggleSkip}
        />
      </>
    )
  }

  return (
    <p className="home__select-hint">
      {scheduler.characterName} · {scheduler.worldName} · Lv.{scheduler.characterLevel} ·{' '}
      {scheduler.characterClass} {scheduler.date && `(${scheduler.date.slice(0, 10)} 기준)`}
    </p>
  )
}

/**
 * cycle 필드에 "주"가 들어가면 주간, 그 외는 일일로 취급한다.
 * (정확한 cycle 원문 값 목록을 다 확인하지는 못해서 쓰는 휴리스틱 - 실제로 다르게
 * 나오는 값이 있으면 이 판별식만 고치면 된다.)
 */
function isWeeklyCycle(cycle) {
  return (cycle ?? '').includes('주')
}

/**
 * 보스 목록 - 같은 보스 이름 아래 난이도별로 묶어서, 난이도는 라디오 버튼처럼
 * 하나만 고를 수 있게 한다(같은 보스를 여러 난이도로 중복해서 잡을 일은 없으니까).
 * 전체 선택 개수는 useBossSelection이 주간 처치 가능 횟수(12)로 제한해준다.
 */
function BossGroupList({ items, isSelected, hasAnySelection, atLimit, onToggle }) {
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
        const disableNew = atLimit && !selected

        return (
          <div key={bossName} className="home__boss-group">
            <p className="home__boss-group-name">{bossName}</p>
            <div className="home__boss-difficulty-row">
              {difficulties.map((d) => {
                const checked = isSelected(bossName, d.difficulty)
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
                      onClick={() => onToggle(bossName, d.difficulty)}
                      disabled={disableNew && !checked}
                    />
                    {d.difficulty}
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * 보스 콘텐츠 - 스케줄러 응답의 bossContents를 재사용한다(별도 API 없음).
 * cycle 기준으로 일일/주간 버튼 두 개로 나누고, 각 버튼을 누르면 그 목록만 보여준다.
 */
function BossSection({ scheduler, view, bossSelection }) {
  const bossContents = scheduler.bossContents ?? []
  const dailyBosses = bossContents.filter((b) => !isWeeklyCycle(b.cycle))
  const weeklyBosses = bossContents.filter((b) => isWeeklyCycle(b.cycle))

  if (view === 'daily' || view === 'weekly') {
    const isDaily = view === 'daily'
    return (
      <>
        <p className="home__select-hint">
          {isDaily ? '일일 보스' : '주간 보스'} · 선택 {bossSelection.selectedCount}/{bossSelection.limit}
        </p>
        <BossGroupList
          items={isDaily ? dailyBosses : weeklyBosses}
          isSelected={bossSelection.isSelected}
          hasAnySelection={bossSelection.hasAnySelection}
          atLimit={bossSelection.atLimit}
          onToggle={bossSelection.toggle}
        />
      </>
    )
  }

  return (
    <p className="home__select-hint">
      {scheduler.characterName} · {scheduler.worldName} · 이번 주 보스 선택 {bossSelection.selectedCount}/
      {bossSelection.limit}마리
    </p>
  )
}

/**
 * 아카이브 페이지 콘텐츠. BookFlipStage 안의 <Page>에 그대로 얹히는
 * "내용물"이라서, 자기 자신을 감싸는 책 모양이나 레이아웃(section 등)은
 * 만들지 않는다 - 다른 페이지(ApiKeyPage, CharacterSelectPage 등)와 완전히
 * 같은 방식이라 캐릭터 선택부터 이어지는 디자인이 자연스럽게 유지된다.
 *
 * 카테고리 선택 UI는 홈/다크모드 버튼 바로 아래 고정되는 CategorySelector로 뺐다
 * (예전의 큰 캡슐형 옆 패널 대신).
 *
 * 공지사항 티커는 여기 없다 - 화면 상단에 별도로 떠 있도록 Home.jsx에서 렌더링한다.
 *
 * 보스 콘텐츠는 스케줄러와 같은 API(scheduler.bossContents)를 재사용한다.
 */
export default function ArchivePage({
  categories,
  active,
  onSelectCategory,
  onBack,
  levelHistory,
  levelHistoryLoading,
  levelHistoryError,
  eventNotices,
  eventNoticesLoading,
  eventNoticesError,
  scheduler,
  schedulerLoading,
  schedulerError,
}) {
  const activeLabel = categories.find((c) => c.key === active)?.label
  const bossSelection = useBossSelection(scheduler?.characterName)

  // 'overview' | 'daily' | 'weekly' - 다른 카테고리로 갔다가 돌아오면 ArchivePage
  // 자체는 리마운트되지 않으므로, 카테고리 클릭(onSelectCategory) 핸들러 쪽에서
  // 이 상태들을 초기화해준다 (아래 handleSelectCategory).
  const [schedulerView, setSchedulerView] = useState('overview')
  const [bossView, setBossView] = useState('overview')

  const handleSelectCategory = (key) => {
    if (key !== 'scheduler') setSchedulerView('overview')
    if (key !== 'boss') setBossView('overview')
    onSelectCategory(key)
  }

  const inSchedulerDetail = active === 'scheduler' && schedulerView !== 'overview'
  const inBossDetail = active === 'boss' && bossView !== 'overview'
  // 제목을 담는 콘텐츠 박스 자체는 항상 "레벨/스케줄러/보스 공용" 클래스를 쓰는데,
  // 상세 목록으로 들어가면 제목이 위로 붙고 목록이 커질 공간을 벌어주기 위해
  // 별도 클래스를 얹어서 padding-top을 CSS 트랜지션으로 부드럽게 줄인다.
  const levelContentClass =
    'home__level-content' + (inSchedulerDetail || inBossDetail ? ' home__level-content--compact' : '')

  return (
    <>
      <CategorySelector categories={categories} active={active} onSelectCategory={handleSelectCategory} />

      <div className="home__result-datetime">
        <DateTimeLabel />
      </div>

      {active === 'level' ? (
        <div className="home__level-content">
          <h2 className="display home__select-title">레벨 진척도</h2>

          {levelHistoryLoading && <p>최근 기록을 불러오는 중...</p>}
          {levelHistoryError && <p className="home__apikey-error">{levelHistoryError}</p>}

          {!levelHistoryLoading && !levelHistoryError && levelHistory && (
            levelHistory.levelUpDate ? (
              <div className="home__level-summary">
                <p className="home__level-current">현재 Lv.{levelHistory.currentLevel}</p>
                <div className="home__level-summary-row">
                  <span className="home__level-summary-label">최근 레벨업</span>
                  <span className="home__level-summary-value">{levelHistory.levelUpDate}</span>
                </div>
                <div className="home__level-summary-row">
                  <span className="home__level-summary-label">경과</span>
                  <span className="home__level-summary-value">
                    {levelHistory.daysSinceLevelUp === 0 ? '오늘' : `${levelHistory.daysSinceLevelUp}일 지남`}
                  </span>
                </div>
              </div>
            ) : (
              <p className="home__select-hint">
                최근 {levelHistory.lookbackDays}일 안에서는 레벨업 기록을 찾지 못했어요.
              </p>
            )
          )}
        </div>
      ) : active === 'event' ? (
        <div className="home__notice-page">
          <h2 className="display home__select-title">진행 중 이벤트</h2>

          {eventNoticesLoading && <p>불러오는 중...</p>}
          {eventNoticesError && <p className="home__apikey-error">{eventNoticesError}</p>}

          {!eventNoticesLoading && !eventNoticesError && eventNotices && (
            eventNotices.length > 0 ? (
              <div className="home__notice-bookmarks">
                {eventNotices.map((n) => (
                  <a
                    key={n.noticeId ?? n.title}
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="home__notice-bookmark"
                  >
                    <span className="home__notice-bookmark-title">{n.title}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="home__select-hint">지금은 표시할 항목이 없어요.</p>
            )
          )}
        </div>
      ) : active === 'scheduler' ? (
        <div className={levelContentClass}>
          <h2 className="display home__select-title">스케줄러</h2>

          {schedulerLoading && <p>불러오는 중...</p>}
          {schedulerError && <p className="home__apikey-error">{schedulerError}</p>}

          {!schedulerLoading && !schedulerError && scheduler && schedulerView === 'overview' && (
            <>
              <SchedulerSection scheduler={scheduler} view={schedulerView} />
              <div className="home__scheduler-nav">
                <button type="button" onClick={() => setSchedulerView('daily')} className="home__scheduler-nav-button">
                  일일 콘텐츠
                  <span className="home__scheduler-nav-count">{scheduler.dailyContents?.length ?? 0}</span>
                </button>
                <button type="button" onClick={() => setSchedulerView('weekly')} className="home__scheduler-nav-button">
                  주간 콘텐츠
                  <span className="home__scheduler-nav-count">{scheduler.weeklyContents?.length ?? 0}</span>
                </button>
              </div>
            </>
          )}

          {!schedulerLoading && !schedulerError && scheduler && schedulerView !== 'overview' && (
            <SchedulerSection scheduler={scheduler} view={schedulerView} />
          )}
        </div>
      ) : active === 'boss' ? (
        <div className={levelContentClass}>
          <h2 className="display home__select-title">보스</h2>

          {schedulerLoading && <p>불러오는 중...</p>}
          {schedulerError && <p className="home__apikey-error">{schedulerError}</p>}

          {!schedulerLoading && !schedulerError && scheduler && bossView === 'overview' && (
            <>
              <BossSection scheduler={scheduler} view={bossView} bossSelection={bossSelection} />
              <div className="home__scheduler-nav">
                <button type="button" onClick={() => setBossView('daily')} className="home__scheduler-nav-button">
                  일일 보스
                  <span className="home__scheduler-nav-count">
                    {scheduler.bossContents?.filter((b) => !isWeeklyCycle(b.cycle)).length ?? 0}
                  </span>
                </button>
                <button type="button" onClick={() => setBossView('weekly')} className="home__scheduler-nav-button">
                  주간 보스
                  <span className="home__scheduler-nav-count">
                    {scheduler.bossContents?.filter((b) => isWeeklyCycle(b.cycle)).length ?? 0}
                  </span>
                </button>
              </div>
            </>
          )}

          {!schedulerLoading && !schedulerError && scheduler && bossView !== 'overview' && (
            <BossSection scheduler={scheduler} view={bossView} bossSelection={bossSelection} />
          )}
        </div>
      ) : (
        <div className="home__result-content">
          <p className="display home__result-my">MY</p>
          <h1 className="display home__result-title">MAPLE STORY</h1>
          <p className="home__select-hint">'{activeLabel}' 카테고리는 아직 연동 중이에요.</p>
        </div>
      )}

      <div className="home__archive-bottom-links">
        {inSchedulerDetail && (
          <button onClick={() => setSchedulerView('overview')} className="home__archive-back">
            ← 스케줄러로
          </button>
        )}
        {inBossDetail && (
          <button onClick={() => setBossView('overview')} className="home__archive-back">
            ← 보스로
          </button>
        )}
        <button onClick={onBack} className="home__archive-back">
          ← 캐릭터 카드로
        </button>
      </div>
    </>
  )
}
