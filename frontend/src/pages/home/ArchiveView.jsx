import Book from '../../components/Book.jsx'
import TickDivider from '../../components/TickDivider.jsx'
import DateTimeLabel from '../../components/DateTimeLabel.jsx'
import CategoryPanel from '../../components/CategoryPanel.jsx'
import '../../css/home-shared.css'
import '../../css/home-archive.css'

const COMPACT_BOOK_MAX_WIDTH = 760

const QUEST_STATE_LABEL = { '0': '기타', '1': '진행 중', '2': '완료' }

function DailyContentList({ items }) {
  if (!items || items.length === 0) {
    return <p className="home__select-hint">표시할 항목이 없어요.</p>
  }
  return (
    <div className="home__scheduler-list">
      {items.map((item) => {
        const isQuest = item.type === 'quest'
        const done = isQuest ? item.questState === '2' : item.nowCount >= item.maxCount
        return (
          <div key={item.contentName} className="home__scheduler-item">
            <span className="home__scheduler-item-name">{item.contentName}</span>
            <span className={'home__scheduler-item-badge' + (done ? ' home__scheduler-item-badge--done' : '')}>
              {isQuest ? QUEST_STATE_LABEL[item.questState] ?? '기타' : `${item.nowCount ?? 0}/${item.maxCount ?? 0}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function BossContentList({ items }) {
  if (!items || items.length === 0) {
    return <p className="home__select-hint">표시할 항목이 없어요.</p>
  }
  return (
    <div className="home__scheduler-list">
      {items.map((item) => {
        const done = item.completeFlag === 'true'
        return (
          <div key={`${item.contentName}-${item.difficulty}`} className="home__scheduler-item">
            <span className="home__scheduler-item-name">
              {item.contentName} <span className="home__scheduler-item-sub">({item.difficulty})</span>
            </span>
            <span className={'home__scheduler-item-badge' + (done ? ' home__scheduler-item-badge--done' : '')}>
              {done ? '완료' : '미완료'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function ArchiveView({
  categories,
  active,
  onSelectCategory,
  onBack,
  levelHistory,
  levelHistoryLoading,
  levelHistoryError,
  notices,
  noticesLoading,
  noticesError,
  scheduler,
  schedulerLoading,
  schedulerError,
}) {
  const activeLabel = categories.find((c) => c.key === active)?.label
  const isNoticeCategory = active === 'event' || active === 'notice'

  const bookContent = (
    <>
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
      ) : isNoticeCategory ? (
        <div className="home__level-content">
          <h2 className="display home__select-title">{active === 'event' ? '진행 중 이벤트' : '공지사항'}</h2>

          {noticesLoading && <p>불러오는 중...</p>}
          {noticesError && <p className="home__apikey-error">{noticesError}</p>}

          {!noticesLoading && !noticesError && notices && (
            notices.length > 0 ? (
              <div className="home__notice-list">
                {notices.map((n) => (
                  <a
                    key={n.noticeId ?? n.title}
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="home__notice-item"
                  >
                    <span className="home__notice-title">{n.title}</span>
                    {n.date && <span className="home__notice-date">{n.date}</span>}
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
              <div className="home__level-summary">
                <div className="home__level-summary-row">
                  <span className="home__level-summary-label">주간 보스 처치</span>
                  <span className="home__level-summary-value">
                    {scheduler.weeklyBossClearCount ?? '-'} / {scheduler.weeklyBossClearLimitCount ?? '-'}
                  </span>
                </div>
              </div>

              <div className="home__scheduler-section">
                <p className="home__select-hint">일일 콘텐츠</p>
                <DailyContentList items={scheduler.dailyContents} />
              </div>

              <div className="home__scheduler-section">
                <p className="home__select-hint">보스 콘텐츠</p>
                <BossContentList items={scheduler.bossContents} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="home__result-content">
          <p className="display home__result-my">MY</p>
          <div className="home__result-divider">
            <TickDivider width={220} />
          </div>
          <h1 className="display home__result-title">MAPLE STORY</h1>
          <p className="home__select-hint">'{activeLabel}' 카테고리는 아직 연동 중이에요.</p>
        </div>
      )}
    </>
  )

  return (
    <section className="home__result">
      <Book maxWidth={COMPACT_BOOK_MAX_WIDTH}>{bookContent}</Book>

      <div className="home__side">
        <CategoryPanel categories={categories} active={active} onSelect={onSelectCategory} />
        <button onClick={onBack} className="home__reset-link">
          ← 캐릭터 카드로
        </button>
      </div>
    </section>
  )
}
