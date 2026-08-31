import '../../../css/home-shared.css'
import '../../../css/home-archive-shared.css'

/**
 * 왼쪽 페이지 - 보스 개요(archive-boss)의 짝(왼쪽) 페이지. BookFlipStage의
 * renderLeftPageContent가 이 내용을 얹어준다(다른 페이지들처럼 빈 페이지로
 * 두지 않고) - BossSelectionPage(boss-daily/weekly)와 같은 방식이다.
 *
 * 우리 앱의 "선택" 카운트(계획)는 오른쪽 개요 페이지에 그대로 두고, 여기서는
 * 넥슨이 실제로 기록한 이번 주 보스 처치 수만 보여준다 - 레벨 카테고리의
 * 요약 카드(home__level-summary)와 같은 스타일을 재사용해서, 다른 카테고리
 * 요약 화면과 톤을 맞춘다.
 */
export default function BossOverviewLeftPage({ scheduler }) {
  const hasClearData = scheduler?.weeklyBossClearCount != null && scheduler?.weeklyBossClearLimitCount != null

  return (
    <div className="home__level-content home__level-content--left">
      <h2 className="display home__select-title">보스 처치 현황</h2>

      {hasClearData ? (
        <div className="home__level-summary">
          <p className="home__level-current">
            {scheduler.weeklyBossClearCount}/{scheduler.weeklyBossClearLimitCount}마리
          </p>
          <div className="home__level-summary-row">
            <span className="home__level-summary-label">기준</span>
            <span className="home__level-summary-value">넥슨 공식 기록</span>
          </div>
          <p className="home__level-note">이번 주(목요일 초기화 기준)에 처치한 주간 보스 수예요.</p>
        </div>
      ) : (
        <p className="home__select-hint">보스 처치 기록을 불러오지 못했어요.</p>
      )}
    </div>
  )
}
