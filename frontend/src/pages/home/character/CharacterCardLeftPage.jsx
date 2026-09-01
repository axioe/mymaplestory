import TodoReminderBanner from './TodoReminderBanner.jsx'
import '../../../css/home-shared.css'
import '../../../css/home-archive-shared.css'
import '../../../css/home-card.css'

/**
 * 왼쪽 페이지 - 캐릭터 카드(card)의 짝(왼쪽) 페이지. 원래 오른쪽 카드 페이지
 * 하단에 있던 "오늘의 할 일" 리마인더를 여기로 옮겼다 - 카드 자체가 다운로드
 * 캡쳐 대상이라, 카드 아래에 계속 늘어나는 리마인더가 같이 딸려서 캡쳐/레이아웃이
 * 복잡해지는 문제가 있었다.
 */
export default function CharacterCardLeftPage({ characterName, scheduler, onGoDaily, onGoBossWeekly }) {
  return (
    <div className="home__level-content home__level-content--left">
      <TodoReminderBanner
        characterName={characterName}
        scheduler={scheduler}
        onGoDaily={onGoDaily}
        onGoBossWeekly={onGoBossWeekly}
      />
    </div>
  )
}
