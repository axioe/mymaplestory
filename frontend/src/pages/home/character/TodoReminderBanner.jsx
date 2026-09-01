import { useSkipTracker } from '../../../hooks/useSkipTracker.js'
import { useBossClearTracker } from '../../../hooks/useBossClearTracker.js'
import { useBossSelectionContext } from '../../../context/BossSelectionContext.jsx'
import { isContentDone } from '../../../utils/schedulerHelpers.js'
import '../../../css/home-card.css'

/**
 * 캐릭터 카드 화면에 얹는 "오늘의 할 일" 리마인더 - 이메일/푸시 알림 같은
 * 외부 인프라 없이, 앱을 열었을 때 바로 눈에 띄게 "아직 안 한 게 있다"만
 * 알려준다.
 *
 * - 일일 콘텐츠: 넥슨이 내려주는 진행 상태(quest_state/진행률)를 기준으로
 *   완료 여부를 판단하되, 사용자가 "스킵"으로 표시해둔 항목은 제외한다
 *   (스킵은 "이건 신경 안 쓸래"라는 개인 의사표시라 - useSkipTracker).
 * - 주간 보스: 넥슨 쪽엔 우리가 추적하는 "선택한 보스" 개념 자체가 없어서,
 *   자체 DB에 저장해둔 이번 주 선택(useBossSelectionContext) 중
 *   완료 체크(useBossClearTracker, PR #17)가 안 된 것만 센다.
 *
 * 둘 다 0개면 조용히 아무것도 렌더링하지 않는다 - "다 했어요!" 같은 긍정
 * 메시지까지는 넣지 않았다(정보가 아직 안 왔을 때도 0개로 보여서 헷갈릴 수
 * 있어서, 리마인더가 필요 없을 땐 그냥 없는 게 낫다고 판단).
 */
export default function TodoReminderBanner({ characterName, scheduler, onGoDaily, onGoBossWeekly }) {
  const { isSkipped } = useSkipTracker(characterName)
  const bossClear = useBossClearTracker(characterName)
  const bossSelection = useBossSelectionContext()

  const dailyItems = scheduler?.dailyContents ?? []
  const dailyRemaining = dailyItems.filter(
    (item) => !isContentDone(item) && !isSkipped(item.contentName)
  ).length

  const weeklyBossRemaining = bossSelection.weeklySelections.filter(
    (s) => !bossClear.isCleared(s.bossName)
  ).length

  if (dailyRemaining === 0 && weeklyBossRemaining === 0) return null

  return (
    <div className="home__card-todo home__card-capture-exclude">
      <p className="home__card-todo-title">오늘의 할 일</p>
      {dailyRemaining > 0 && (
        <button type="button" onClick={onGoDaily} className="home__card-todo-item">
          <span>일일 콘텐츠 미완료</span>
          <span className="home__card-todo-count">{dailyRemaining}개</span>
        </button>
      )}
      {weeklyBossRemaining > 0 && (
        <button type="button" onClick={onGoBossWeekly} className="home__card-todo-item">
          <span>이번 주 보스 미처치</span>
          <span className="home__card-todo-count">{weeklyBossRemaining}마리</span>
        </button>
      )}
    </div>
  )
}
