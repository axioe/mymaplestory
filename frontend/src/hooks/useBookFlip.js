import { useRef, useState } from 'react'

export const PAGE_ORDER = ['start', 'apikey', 'select', 'card', 'archive']

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
    const contentIndex = PAGE_ORDER.indexOf(next)
    const pageFlip = getPageFlip()
    if (contentIndex < 0 || !pageFlip) {
      setPage(next) // 라이브러리가 아직 준비 안 된 경우를 위한 안전망
      return
    }
    pageFlip.flip(contentToFlipIndex(contentIndex))
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
