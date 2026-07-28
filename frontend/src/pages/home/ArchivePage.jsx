import { useState } from 'react'
import DateTimeLabel from '../../components/DateTimeLabel.jsx'
import CategorySelector from './CategorySelector.jsx'
import { useSkipTracker } from '../../hooks/useSkipTracker.js'
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
 * 항목마다 배지에 뭘 어떻게 보여줄지 결정한다.
 * - 퀘스트: 미수락/진행 중/완료
 * - "에픽던전"으로 시작하는 항목: contents 타입이라도 진행률(n/m) 대신 완료/미완료로 표시
 * - max_count가 0인 항목(예: [길드] 지하 수로): "n/0"처럼 분수로 표시하면 이상해서
 *   그냥 "n점"으로 표시
 * - 그 외 일반 contents: 기존처럼 n/m 진행률 표시
 */
function getContentDisplay(item) {
  const isQuest = item.type === 'quest'
  const isEpicDungeon = item.contentName?.startsWith('에픽던전')
  const now = item.nowCount ?? 0
  const max = item.maxCount ?? 0
  const cleared = now >= max && max > 0

  if (isQuest) {
    return {
      done: item.questState === '2',
      badgeClass: QUEST_STATE_CLASS[item.questState] ?? '',
      text: QUEST_STATE_LABEL[item.questState] ?? '미수락',
    }
  }
  if (isEpicDungeon) {
    return {
      done: cleared,
      badgeClass: cleared ? ' home__scheduler-item-badge--done' : '',
      text: cleared ? '완료' : '미완료',
    }
  }
  if (max === 0) {
    return {
      done: now > 0,
      badgeClass: now > 0 ? ' home__scheduler-item-badge--done' : '',
      text: `${now}점`,
    }
  }
  return {
    done: cleared,
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

  return (
    <div className="home__scheduler-list">
      {items.map((item) => {
        const { badgeClass, text } = getContentDisplay(item)
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
function SchedulerSection({ scheduler, view, isSkipped, toggleSkip }) {
  const dailyCount = scheduler.dailyContents?.length ?? 0
  const weeklyCount = scheduler.weeklyContents?.length ?? 0

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
    <>
      <p className="home__select-hint">
        {scheduler.characterName} · {scheduler.worldName} · Lv.{scheduler.characterLevel} ·{' '}
        {scheduler.characterClass} {scheduler.date && `(${scheduler.date.slice(0, 10)} 기준)`}
      </p>
    </>
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
 * 스케줄러의 보스 콘텐츠는 여기서 안 보여준다 - "보스" 카테고리 쪽에 따로
 * 합쳐질 예정이라 중복을 피했다.
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
  const { isSkipped, toggleSkip } = useSkipTracker(scheduler?.characterName)

  // 'overview' | 'daily' | 'weekly' - 다른 카테고리로 갔다가 스케줄러로 돌아오면
  // ArchivePage 자체는 리마운트되지 않으므로, 카테고리 클릭(onSelectCategory)
  // 핸들러 쪽에서 이 상태를 초기화해준다 (아래 handleSelectCategory).
  const [schedulerView, setSchedulerView] = useState('overview')

  const handleSelectCategory = (key) => {
    if (key !== 'scheduler') setSchedulerView('overview')
    onSelectCategory(key)
  }

  const inSchedulerDetail = active === 'scheduler' && schedulerView !== 'overview'
  // 제목을 담는 콘텐츠 박스 자체는 항상 "레벨/스케줄러 공용" 클래스를 쓰는데,
  // 상세 목록으로 들어가면 제목이 위로 붙고 목록이 커질 공간을 벌어주기 위해
  // 별도 클래스를 얹어서 padding-top을 CSS 트랜지션으로 부드럽게 줄인다.
  const levelContentClass = 'home__level-content' + (inSchedulerDetail ? ' home__level-content--compact' : '')

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
              <SchedulerSection scheduler={scheduler} view={schedulerView} isSkipped={isSkipped} toggleSkip={toggleSkip} />
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
            <SchedulerSection scheduler={scheduler} view={schedulerView} isSkipped={isSkipped} toggleSkip={toggleSkip} />
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
        <button onClick={onBack} className="home__archive-back">
          ← 캐릭터 카드로
        </button>
      </div>
    </>
  )
}
