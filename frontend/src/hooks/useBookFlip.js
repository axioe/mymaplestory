import { useRef, useState } from 'react'

export const PAGE_ORDER = [
  'start',
  'apikey',
  'select',
  'select-detail',
  'card',
  'archive-boss',
  'archive-loot',
  'archive-level',
  'archive-union',
  'archive-event',
  'archive-scheduler',
  'scheduler-daily',
  'scheduler-weekly',
  'boss-daily',
  'boss-weekly',
  'boss-weekly-maple',
  'boss-weekly-arcane',
  'boss-weekly-grandis',
  'union-raider',
  'union-artifact',
  'union-champion',
]

/**
 * 첫 페이지(start, 표지)만 짝 없이 단독으로 보여주고(HTMLFlipBook의 showCover={true}),
 * 그 다음부터는 콘텐츠 페이지 하나마다 앞에 빈 페이지를 하나씩 끼워 넣는다.
 * -> 화면이 넓어서 두 페이지가 나란히(스프레드) 보일 때도
 *    표지는 혼자, 이후로는 항상 "왼쪽 = 공백, 오른쪽 = 실제 콘텐츠" 조합만 나온다.
 *
 * 실제 렌더링되는 페이지 인덱스:
 *   0 = start(표지, 단독)
 *   1 = 공백, 2 = apikey
 *   3 = 공백, 4 = select
 *   5 = 공백, 6 = card
 *   7 = 공백, 8 = archive
 *   9 = 공백, 10 = scheduler-daily
 *   11 = 공백, 12 = scheduler-weekly
 *   13 = 공백, 14 = boss-daily
 *   15 = 공백, 16 = boss-weekly (지역 3개 버튼만 있는 개요 페이지)
 *   17 = 공백, 18 = boss-weekly-maple (메이플월드)
 *   19 = 공백, 20 = boss-weekly-arcane (아케인)
 *   21 = 공백, 22 = boss-weekly-grandis (그란디스, 검은 마법사 등 월간 보스도 여기 통합됨)
 */
const contentToFlipIndex = (contentIndex) => (contentIndex === 0 ? 0 : contentIndex * 2)

function flipIndexToContent(flipIndex) {
  if (flipIndex === 0) return 0
  if (flipIndex % 2 === 0) return flipIndex / 2
  return null // 빈 페이지
}

/**
 * react-pageflip(StPageFlip)로 페이지 전환을 맡긴다.
 * 실제 회전/그림자/곡선 애니메이션은 라이브러리가 전부 처리하고,
 * 여기서는 "지금 어떤 페이지인지"만 추적한다.
 *
 * - page: 현재 확정된 페이지 키
 * - flipBookRef: <HTMLFlipBook ref={flipBookRef}> 에 그대로 연결해서 쓴다.
 * - flipTo(next): 실제 페이지 넘김 애니메이션을 재생하면서 이동한다.
 * - jumpTo(next): 애니메이션 없이 즉시 이동한다 (초기화, 뒤로가기 등).
 * - handleFlip(flipIndex): HTMLFlipBook의 onFlip 이벤트에 그대로 연결한다.
 */
export function useBookFlip(initialPage) {
  const flipBookRef = useRef(null)
  const [page, setPage] = useState(initialPage)

  const getPageFlip = () => flipBookRef.current?.pageFlip?.()

  const flipTo = (next) => {
    const nextIndex = PAGE_ORDER.indexOf(next)
    // onFlip 콜백(react-pageflip 라이브러리 이벤트)이 프로그래밍 방식 flip()에는
    // 확실히 발생한다는 보장이 없어서, 그것만 기다리면 "화면은 넘어갔는데 page
    // 상태는 그대로"인 경우가 생겨 그 페이지에 딸린 데이터 조회가 영영 시작 안
    // 되는 버그가 있었다. 그래서 애니메이션 시작과 동시에 낙관적으로 먼저
    // 갱신한다 (onFlip이 나중에 와도 같은 값이라 문제 없음).
    setPage(next)
    attemptFlip(next, nextIndex, 0)
  }

  /**
   * 표지("시작하기")에서 다음 페이지로 넘어가는, 마운트 직후 첫 페이지 전환에서
   * react-pageflip 내부 인스턴스가 아직 완전히 준비되기 전에 flip()이 호출되어
   * 아예 반응이 없는 경우가 있었다(getPageFlip()이 null을 반환). 그래서 준비가
   * 안 됐으면 조금 기다렸다가 다시 시도한다 - 최대 1초(100ms x 10회) 정도면
   * 충분하고, 그 이후로는 이미 여러 번 써서 안정적으로 준비되어 있다.
   */
  const attemptFlip = (next, nextIndex, retryCount) => {
    if (nextIndex < 0) return
    const pageFlip = getPageFlip()
    if (!pageFlip) {
      if (retryCount < 10) {
        setTimeout(() => attemptFlip(next, nextIndex, retryCount + 1), 100)
      }
      return
    }

    const targetFlipIndex = contentToFlipIndex(nextIndex)
    // 목표 페이지가 몇 장 떨어져 있든 flip()은 한 번만 호출한다 - 예전에
    // 한 장씩 순서대로 여러 번 호출했더니 오히려 너무 부산스럽고 부담스러웠다.
    pageFlip.flip(targetFlipIndex)

    // flip()이 라이브러리 특성상 안 움직이는 경우가 있어서, 애니메이션이 끝났을
    // 시점에 실제로 도착했는지 확인하고 어긋나 있을 때만 보정한다.
    // (한때 "확인 없이 무조건 보정"으로 바꿔봤는데, 그러면 이미 잘 도착한
    // 경우에도 매번 라이브러리가 DOM을 한 번 더 건드리게 되고, 마침 그 타이밍에
    // React가 그 페이지 콘텐츠를 렌더링 중이면 "insertBefore/removeChild - not a
    // child of this node" 충돌이 났다. getCurrentPageIndex()는 라이브러리
    // 공식 문서에 있는 정식 메서드라 확인 자체는 안전하니, 진짜 필요할 때만
    // 최소한으로 보정하는 쪽이 훨씬 안전하다.)
    setTimeout(() => {
      if (typeof pageFlip.getCurrentPageIndex === 'function' && pageFlip.getCurrentPageIndex() !== targetFlipIndex) {
        pageFlip.turnToPage(targetFlipIndex)
      }
    }, 900)
  }

  const jumpTo = (next) => {
    const contentIndex = PAGE_ORDER.indexOf(next)
    const pageFlip = getPageFlip()
    if (contentIndex >= 0 && pageFlip) {
      pageFlip.turnToPage(contentToFlipIndex(contentIndex)) // 애니메이션 없이 즉시 이동
    }
    setPage(next)
  }

  const handleFlip = (flipIndex) => {
    const contentIndex = flipIndexToContent(flipIndex)
    if (contentIndex !== null) setPage(PAGE_ORDER[contentIndex] ?? page)
  }

  // 아카이브 화면 등으로 전환됐다가 돌아오면 HTMLFlipBook이 통째로 다시 마운트되면서
  // 늘 0번 페이지(표지)부터 다시 시작해버리는 문제가 있었다. 재마운트되더라도
  // 항상 지금 page 상태에 맞는 위치에서 시작하도록 인덱스를 계산해서 넘겨준다.
  const startFlipIndex = contentToFlipIndex(Math.max(PAGE_ORDER.indexOf(page), 0))

  return { page, flipBookRef, flipTo, jumpTo, handleFlip, startFlipIndex }
}
