import { useState } from 'react'
import DateTimeLabel from '../../components/DateTimeLabel.jsx'
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
 * "[에픽던전] ~~~" 또는 "[에픽 던전] ~~~"처럼 대괄호/띄어쓰기가 붙는 경우가 섞여
 * 있어서, 비교 전에 공백을 다 지우고 나서 판별한다.
 */
function isEpicDungeonItem(item) {
  const normalized = (item.contentName ?? '').replace(/\s/g, '')
  return item.type !== 'quest' && normalized.includes('에픽던전')
}

function isCleared(item) {
  const now = item.nowCount ?? 0
  const max = item.maxCount ?? 0
  return max > 0 && now >= max
}

const EPIC_DUNGEON_WEEKLY_LIMIT = 2

/**
 * 항목마다 배지에 뭘 어떻게 보여줄지 결정한다.
 * - 퀘스트: 미수락/진행 중/완료
 * - "에픽던전"이 이름에 들어간 항목: contents 타입이라도 진행률(n/m) 대신 완료/미완료로
 *   표시하고, 주당 2개까지만 클리어 가능하므로 이미 2개를 완료했다면 나머지 항목은
 *   "미완료" 대신 한도 초과 안내를 보여준다.
 * - max_count가 0인 항목(예: [길드] 지하 수로): "n/0"처럼 분수로 표시하면 이상해서
 *   그냥 "n점"으로 표시
 * - 그 외 일반 contents: 기존처럼 n/m 진행률 표시
 */
function getContentDisplay(item, epicDungeonDoneCount) {
  const isQuest = item.type === 'quest'
  const now = item.nowCount ?? 0
  const max = item.maxCount ?? 0
  const cleared = isCleared(item)

  if (isQuest) {
    return {
      badgeClass: QUEST_STATE_CLASS[item.questState] ?? '',
      text: QUEST_STATE_LABEL[item.questState] ?? '미수락',
    }
  }
  if (isEpicDungeonItem(item)) {
    if (cleared) {
      return { badgeClass: ' home__scheduler-item-badge--done', text: '완료' }
    }
    if (epicDungeonDoneCount >= EPIC_DUNGEON_WEEKLY_LIMIT) {
      return { badgeClass: ' home__scheduler-item-badge--limit', text: '최대로 할 수 있는 에픽던전을 넘겼습니다' }
    }
    return { badgeClass: '', text: '미완료' }
  }
  if (max === 0) {
    return {
      badgeClass: now > 0 ? ' home__scheduler-item-badge--done' : '',
      text: `${now}점`,
    }
  }
  return {
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

  const epicDungeonDoneCount = items.filter((i) => isEpicDungeonItem(i) && isCleared(i)).length

  return (
    <div className="home__scheduler-list">
      {items.map((item) => {
        const { badgeClass, text } = getContentDisplay(item, epicDungeonDoneCount)
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

const CYCLE_LABEL = { daily: '일일 콘텐츠', weekly: '주간 콘텐츠' }

/**
 * 일일/주간 콘텐츠 상세 - BookFlipStage 안의 <Page>에 그대로 얹히는 "내용물".
 * 아카이브 페이지(스케줄러 개요)에서 버튼을 누르면 여기로 실제 책장 넘김을 통해
 * 들어온다 (Home.jsx의 flipTo('scheduler-daily') 등) - 보스 상세 페이지와 완전히
 * 같은 방식이라 한 책이 자연스럽게 이어지는 느낌을 준다.
 */
export default function SchedulerDetailPage({ cycle, scheduler, onBack }) {
  const { isSkipped, toggleSkip } = useSkipTracker(scheduler?.characterName)
  const items = cycle === 'daily' ? scheduler?.dailyContents : scheduler?.weeklyContents

  return (
    <>
      <div className="home__result-datetime">
        <DateTimeLabel />
      </div>

      <div className="home__level-content">
        <h2 className="display home__select-title">{CYCLE_LABEL[cycle]}</h2>
        <ContentButtonList items={items} isSkipped={isSkipped} onToggleSkip={toggleSkip} />
      </div>

      <button onClick={onBack} className="home__archive-back home__archive-back--standalone">
        ← 스케줄러로
      </button>
    </>
  )
}
