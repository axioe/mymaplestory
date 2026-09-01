// quest_state: "0"=미수락, "1"=진행 중(수락함), "2"=완료
export const QUEST_STATE_LABEL = { '0': '미수락', '1': '진행 중', '2': '완료' }
export const QUEST_STATE_CLASS = {
  '0': '',
  '1': ' home__scheduler-item-badge--progress',
  '2': ' home__scheduler-item-badge--done',
}

/**
 * "[에픽던전] ~~~" 또는 "[에픽 던전] ~~~"처럼 대괄호/띄어쓰기가 붙는 경우가 섞여
 * 있어서, 비교 전에 공백을 다 지우고 나서 판별한다.
 */
export function isEpicDungeonItem(item) {
  const normalized = (item.contentName ?? '').replace(/\s/g, '')
  return item.type !== 'quest' && normalized.includes('에픽던전')
}

export function isCleared(item) {
  const now = item.nowCount ?? 0
  const max = item.maxCount ?? 0
  return max > 0 && now >= max
}

/**
 * 이 콘텐츠 항목을 "오늘/이번 주에 할 일을 다 했다"고 볼 수 있는지 판단한다.
 * SchedulerDetailPage.jsx의 getContentDisplay와 같은 기준(퀘스트는 quest_state,
 * 그 외는 진행률)을 쓰되, 배지 문구가 아니라 완료 여부(boolean)만 필요한
 * TodoReminderBanner 같은 곳에서 재사용한다.
 */
export function isContentDone(item) {
  if (item.type === 'quest') {
    return item.questState === '2'
  }
  return isCleared(item)
}
