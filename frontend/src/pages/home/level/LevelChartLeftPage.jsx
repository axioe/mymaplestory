import LevelProgressChart from './LevelProgressChart.jsx'
import '../../../css/home-archive-shared.css'

/**
 * history(날짜/레벨/경험치% 오름차순 배열)에서 하루 전 기록과 비교한
 * 증가량을 계산한다. 레벨업이 낀 구간은 경험치%가 100%에서 0%대로
 * 리셋되면서 단순 뺄셈이 큰 음수로 나와 오해를 주므로, 그 구간은 퍼센트
 * 증가량 대신 "레벨업" 배지로 따로 표시한다.
 */
function computeDailyDeltas(history) {
  const rows = []
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1]
    const curr = history[i]
    const levelDiff = curr.level - prev.level
    rows.push({
      date: curr.date,
      levelUp: levelDiff > 0,
      levelDiff,
      expDiff: Number(curr.expRate) - Number(prev.expRate),
    })
  }
  return rows.reverse() // 최근 날짜가 맨 위로 오도록
}

function DailyDeltaList({ history }) {
  const rows = computeDailyDeltas(history)
  if (rows.length === 0) return null

  return (
    <div className="home__level-delta-list">
      <p className="home__level-delta-title">일자별 증가량</p>
      {rows.map((r) => (
        <div key={r.date} className="home__level-delta-row">
          <span className="home__level-delta-date">{r.date.slice(5)}</span>
          {r.levelUp ? (
            <span className="home__level-delta-value home__level-delta-value--levelup">레벨업 +{r.levelDiff}</span>
          ) : (
            <span
              className={
                'home__level-delta-value' +
                (r.expDiff >= 0 ? ' home__level-delta-value--up' : ' home__level-delta-value--down')
              }
            >
              {r.expDiff >= 0 ? '+' : ''}
              {r.expDiff.toFixed(2)}%
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * 왼쪽 페이지 - 레벨 진척도(archive-level)의 짝(왼쪽) 페이지. 레벨 요약
 * 카드(현재 레벨/경험치%/최근 레벨업/경과)는 오른쪽 개요 페이지에 그대로
 * 두고, 차트와 일자별 증가량은 여기로 옮겨서 왼쪽 페이지가 비어 보이지
 * 않게 한다.
 */
export default function LevelChartLeftPage({ levelHistory, levelHistoryLoading, levelHistoryError }) {
  const hasChart = (levelHistory?.history?.length ?? 0) >= 2

  return (
    <div className="home__level-content home__level-content--left home__level-content--chart">
      <h2 className="display home__select-title">경험치 추이</h2>

      {levelHistoryLoading && <p className="home__select-hint">최근 기록을 불러오는 중...</p>}
      {levelHistoryError && <p className="home__apikey-error">{levelHistoryError}</p>}

      {!levelHistoryLoading &&
        !levelHistoryError &&
        levelHistory &&
        (hasChart ? (
          <>
            <LevelProgressChart history={levelHistory.history} />
            <DailyDeltaList history={levelHistory.history} />
          </>
        ) : (
          <p className="home__select-hint">
            최근 {levelHistory.lookbackDays}일 안에서는 기록이 부족해서 아직 그래프를 그릴 수 없어요.
          </p>
        ))}
    </div>
  )
}
