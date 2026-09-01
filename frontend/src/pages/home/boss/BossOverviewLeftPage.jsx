import { useBossSelectionContext } from '../../../context/BossSelectionContext.jsx'
import { useBossClearTracker } from '../../../hooks/useBossClearTracker.js'
import '../../../css/home-shared.css'
import '../../../css/home-archive-shared.css'
import '../../../css/home-boss.css'

/**
 * 왼쪽 페이지 - 보스 개요(archive-boss)의 짝(왼쪽) 페이지. BookFlipStage의
 * renderLeftPageContent가 이 내용을 얹어준다(다른 페이지들처럼 빈 페이지로
 * 두지 않고) - BossSelectionPage(boss-daily/weekly)와 같은 방식이다.
 *
 * 우리 앱의 "선택" 카운트(계획)는 오른쪽 개요 페이지에 그대로 두고, 여기서는
 * 넥슨이 실제로 기록한 이번 주 보스 처치 수(합계만)와, 그 아래에 어느 보스를
 * 처치했는지(우리가 직접 추적하는 개별 완료 체크, PR #17)를 함께 보여준다 -
 * 넥슨 API 자체는 "몇 마리 잡았다"는 합계만 내려주고 어느 보스인지는 안
 * 알려주므로, 개별 목록은 우리 DB에 저장해둔 "선택 + 완료 체크" 조합에서만
 * 알 수 있다(그래서 사용자가 보스-주간 페이지에서 선택/체크해둔 것만 나온다).
 */
export default function BossOverviewLeftPage({ scheduler, characterName }) {
  const hasClearData = scheduler?.weeklyBossClearCount != null && scheduler?.weeklyBossClearLimitCount != null
  const bossSelection = useBossSelectionContext()
  const bossClear = useBossClearTracker(characterName)
  const weeklySelections = bossSelection.weeklySelections

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

      {weeklySelections.length > 0 && (
        <div className="home__boss-clear-list">
          <p className="home__boss-clear-list-title">내가 선택한 보스 중...</p>
          {weeklySelections.map((s) => {
            const cleared = bossClear.isCleared(s.bossName)
            return (
              <div
                key={s.bossName}
                className={'home__boss-clear-list-item' + (cleared ? ' home__boss-clear-list-item--done' : '')}
              >
                <span className="home__boss-clear-list-mark">{cleared ? '✓' : '○'}</span>
                <span className="home__boss-clear-list-name">{s.bossName}</span>
                <span className="home__boss-clear-list-diff">{s.difficulty.toUpperCase()}</span>
              </div>
            )
          })}
          <p className="home__level-note">
            넥슨 API는 어느 보스를 잡았는지는 안 알려줘서, 보스-주간 화면에서 직접 체크해둔
            기록이에요.
          </p>
        </div>
      )}
    </div>
  )
}
