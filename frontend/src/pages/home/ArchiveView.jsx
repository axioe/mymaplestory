import Book from '../../components/Book.jsx'
import TickDivider from '../../components/TickDivider.jsx'
import DateTimeLabel from '../../components/DateTimeLabel.jsx'
import CategoryPanel from '../../components/CategoryPanel.jsx'
import '../../css/home-shared.css'
import '../../css/home-archive.css'

const COMPACT_BOOK_MAX_WIDTH = 760

export default function ArchiveView({
  categories,
  active,
  onSelectCategory,
  onBack,
  levelHistory,
  levelHistoryLoading,
  levelHistoryError,
}) {
  const activeLabel = categories.find((c) => c.key === active)?.label

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
            levelHistory.levelUps.length > 0 ? (
              <div className="home__level-table-wrap">
                <table className="home__level-table">
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>변경된 레벨</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelHistory.levelUps.map((lv) => (
                      <tr key={lv.date}>
                        <td>{lv.date}</td>
                        <td>{lv.toLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="home__select-hint">최근 {levelHistory.days}일 동안 레벨업 기록이 없어요.</p>
            )
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
