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
 * 일일/주간 콘텐츠 목록 - 항목 이름 자체가 버튼이라 클릭하면 완료 여부가 펼쳐지고,
 * 왼쪽 체크박스는 "이건 스킵할래"라는 개인 표시(localStorage 저장, 넥슨과 무관).
 */
function ContentButtonList({ items, isSkipped, onToggleSkip }) {
  const [expandedName, setExpandedName] = useState(null)

  if (!items || items.length === 0) {
    return <p className="home__select-hint">표시할 항목이 없어요.</p>
  }

  return (
    <div className="home__scheduler-list">
      {items.map((item) => {
        const isQuest = item.type === 'quest'
        const done = !isQuest && item.nowCount >= item.maxCount
        const badgeClass = isQuest
          ? QUEST_STATE_CLASS[item.questState] ?? ''
          : done
            ? ' home__scheduler-item-badge--done'
            : ''
        const isExpanded = expandedName === item.contentName

        return (
          <div key={item.contentName} className="home__scheduler-item">
            <input
              type="checkbox"
              className="home__scheduler-skip"
              checked={isSkipped(item.contentName)}
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
              <span className={'home__scheduler-item-badge' + badgeClass}>
                {isQuest ? QUEST_STATE_LABEL[item.questState] ?? '미수락' : `${item.nowCount ?? 0}/${item.maxCount ?? 0}`}
              </span>
            )}
          </div>
        )
      })}
    </div>
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
 * 공지사항 티커는 여기 없다 - 책 위쪽(페이지 상단)에 별도로 떠 있도록 Home.jsx에서
 * 렌더링한다.
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

  return (
    <>
      <CategorySelector categories={categories} active={active} onSelectCategory={onSelectCategory} />

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
        <div className="home__level-content">
          <h2 className="display home__select-title">스케줄러</h2>

          {schedulerLoading && <p>불러오는 중...</p>}
          {schedulerError && <p className="home__apikey-error">{schedulerError}</p>}

          {!schedulerLoading && !schedulerError && scheduler && (
            <>
              <p className="home__select-hint">
                {scheduler.characterName} · {scheduler.worldName} · Lv.{scheduler.characterLevel} ·{' '}
                {scheduler.characterClass} {scheduler.date && `(${scheduler.date.slice(0, 10)} 기준)`}
              </p>

              <div className="home__scheduler-section">
                <p className="home__select-hint">일일 콘텐츠</p>
                <ContentButtonList
                  items={scheduler.dailyContents}
                  isSkipped={isSkipped}
                  onToggleSkip={toggleSkip}
                />
              </div>

              <div className="home__scheduler-section">
                <p className="home__select-hint">주간 콘텐츠</p>
                <ContentButtonList
                  items={scheduler.weeklyContents}
                  isSkipped={isSkipped}
                  onToggleSkip={toggleSkip}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="home__result-content">
          <p className="display home__result-my">MY</p>
          <h1 className="display home__result-title">MAPLE STORY</h1>
          <p className="home__select-hint">'{activeLabel}' 카테고리는 아직 연동 중이에요.</p>
        </div>
      )}

      <button onClick={onBack} className="home__archive-back">
        ← 캐릭터 카드로
      </button>
    </>
  )
}
