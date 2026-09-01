import LevelProgressChart from './LevelProgressChart.jsx'
import '../../css/home-archive-shared.css'

/**
 * 왼쪽 페이지 - 레벨 진척도(archive-level)의 짝(왼쪽) 페이지. 레벨 요약
 * 카드(현재 레벨/경험치%/최근 레벨업/경과)는 오른쪽 개요 페이지에 그대로
 * 두고, 차트만 여기로 옮겨서 왼쪽 페이지가 비어 보이지 않게 한다.
 */
export default function LevelChartLeftPage({ levelHistory, levelHistoryLoading, levelHistoryError }) {
  const hasChart = (levelHistory?.history?.length ?? 0) >= 2

  return (
    <div className="home__level-content home__level-content--left">
      <h2 className="display home__select-title">경험치 추이</h2>

      {levelHistoryLoading && <p className="home__select-hint">최근 기록을 불러오는 중...</p>}
      {levelHistoryError && <p className="home__apikey-error">{levelHistoryError}</p>}

      {!levelHistoryLoading &&
        !levelHistoryError &&
        levelHistory &&
        (hasChart ? (
          <LevelProgressChart history={levelHistory.history} />
        ) : (
          <p className="home__select-hint">
            최근 {levelHistory.lookbackDays}일 안에서는 기록이 부족해서 아직 그래프를 그릴 수 없어요.
          </p>
        ))}
    </div>
  )
}
