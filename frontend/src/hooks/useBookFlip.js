import { useEffect, useRef, useState } from 'react'

export const PAGE_ORDER = [
  'start',
  'apikey',
  'select',
  'select-detail',
  'card',
  'archive-boss',
  'archive-loot',
  'archive-level',
  'archive-stat',
  'archive-union',
  'archive-event',
  'archive-scheduler',
  'scheduler-daily',
  'scheduler-weekly',
  'boss-daily',
  'boss-weekly',
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
 *   15 = 공백, 16 = boss-weekly (지역 구분 없이 주간+월간 보스 전체를 한 페이지로 통합)
 */
const contentToFlipIndex = (contentIndex) => (contentIndex === 0 ? 0 : contentIndex * 2)

/**
 * pageFlip.getCurrentPageIndex()는 "지금 펼쳐진 스프레드의 왼쪽(첫) 페이지" 인덱스를
 * 돌려준다(page-flip 라이브러리의 PageCollection.showSpread()가 currentPageIndex를
 * spread[0]으로 설정함) - 콘텐츠(오른쪽) 페이지 인덱스가 아니다! 표지(0)는 스프레드가
 * 자기 하나뿐이라 우연히 일치하지만, 그 외 모든 콘텐츠 페이지는 공백(왼쪽) 페이지가
 * "현재 페이지"로 보고된다. 예: apikey(콘텐츠 인덱스 2)가 화면에 정상적으로 떠 있어도
 * getCurrentPageIndex()는 2가 아니라 1(그 앞의 공백 페이지)을 돌려준다. 이 차이를
 * 모르고 contentToFlipIndex()의 결과와 직접 비교하면 항상 "아직 안 도착했다"고
 * 착각해서 끝없이 보정을 반복하게 된다 - 실제로 이 버그 때문에 정상적으로 도착한
 * 페이지를 계속 "틀렸다"고 오판하는 문제가 있었다. getCurrentPageIndex()와 비교할
 * 때는 항상 이 함수를 써야 한다.
 */
const expectedCurrentPageIndex = (contentIndex) =>
  contentIndex === 0 ? 0 : contentToFlipIndex(contentIndex) - 1

/**
 * react-pageflip(StPageFlip)로 페이지 전환을 맡긴다.
 * 실제 회전/그림자/곡선 애니메이션은 라이브러리가 전부 처리하고,
 * 여기서는 "지금 어떤 페이지인지"만 추적한다.
 *
 * - page: 현재 확정된 페이지 키
 * - flipBookRef: <HTMLFlipBook ref={flipBookRef}> 에 그대로 연결해서 쓴다.
 * - flipTo(next): 실제 페이지 넘김 애니메이션을 재생하면서 이동한다.
 * - jumpTo(next): 애니메이션 없이 즉시 이동한다 (초기화, 뒤로가기 등).
 * - handleFlip: HTMLFlipBook의 onFlip prop에 연결하는 자리만 채우는 no-op다 -
 *   실제로 page 상태를 갱신하는 데는 쓰지 않는다(아래 정의부 주석 참고).
 */
export function useBookFlip(initialPage) {
  const flipBookRef = useRef(null)
  const [page, setPage] = useState(initialPage)

  // attemptFlip의 재시도(최대 10회 x 100ms)와 보정(900ms) setTimeout이 unmount 후에도
  // 정리되지 않아서, flipTo() 직후 빠르게 화면을 벗어나면 이미 파괴된 StPageFlip
  // 인스턴스를 나중에 건드려 에러를 던지거나 무의미한 DOM 조작을 시도할 수 있었다.
  // 콜백 실행 시점에 이 값을 확인해서 unmount 이후엔 아무 것도 안 하게 막는다.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const getPageFlip = () => flipBookRef.current?.pageFlip?.()

  /**
   * react-pageflip(HTMLFlipBookForward)은 내부적으로 useEffect(..., [props.children])로
   * "페이지 목록이 바뀌었는지"를 감지해서 pageFlip.updateFromHtml()(페이지 컬렉션을
   * 통째로 새로 만들고 지금 페이지로 다시 show())을 호출한다. 그런데 우리
   * BookFlipStage.jsx는 매 렌더링마다 children 배열을 새로 만들어서 넘기기 때문에
   * (renderPageContent가 최신 데이터를 반영해야 하니 어쩔 수 없음), 그 effect가
   * 사실상 "리렌더링될 때마다" 실행된다.
   *
   * setPage(next) 직후 곧바로 flip()을 호출하면, 같은 setPage로 인해 촉발된
   * 리렌더링 -> react-pageflip의 저 effect -> updateFromHtml()이 지금 막 시작한
   * flip() 애니메이션과 겹쳐서, 라이브러리가 목표보다 한 스프레드 더 넘어간
   * 엉뚱한 위치에 착지하는 버그가 있었다(표지에서 "시작하기"를 누르면 API키
   * 화면을 건너뛰고 서버 선택 화면으로 바로 가버리는 등 - 실제 배포본에서도
   * 재현 확인됨). 이 함수는 그 리렌더링/updateFromHtml이 먼저 끝나고 화면에
   * 반영되도록 한 박자 미룬 뒤에 실제 작업(flip 또는 turnToPage)을 실행한다.
   *
   * requestAnimationFrame이 아니라 setTimeout을 쓴다 - rAF는 브라우저가 다음
   * 프레임을 "그릴 때"에만 실행되는데, 탭이 백그라운드거나 화면에 실제로 그릴
   * 필요가 없다고 판단되면 rAF 콜백이 몇 초에서 몇 십 초까지도 미뤄지거나 아예
   * 멈춘다 - 그동안 flip()이 전혀 호출되지 않아 "표지에서 클릭해도 한참 동안
   * 아무 반응이 없다가 나중에야(watchdog의 즉시 이동으로) 갑자기 다음 페이지로
   * 바뀌는" 증상으로 이어졌다(실측: 최대 17초 이상 멈춰 있다가 watchdog이 대신
   * 처리). setTimeout은 페인트 여부와 무관하게 JS 이벤트 루프 타이머로 실행되므로
   * 이 문제가 없다.
   */
  const afterRenderSettles = (work) => {
    setTimeout(() => {
      setTimeout(() => {
        if (mountedRef.current) work()
      }, 0)
    }, 0)
  }

  const flipTo = (next) => {
    const nextIndex = PAGE_ORDER.indexOf(next)
    // onFlip 콜백(react-pageflip 라이브러리 이벤트)이 프로그래밍 방식 flip()에는
    // 확실히 발생한다는 보장이 없어서, 그것만 기다리면 "화면은 넘어갔는데 page
    // 상태는 그대로"인 경우가 생겨 그 페이지에 딸린 데이터 조회가 영영 시작 안
    // 되는 버그가 있었다. 그래서 애니메이션 시작과 동시에 낙관적으로 먼저
    // 갱신한다 (onFlip이 나중에 와도 같은 값이라 문제 없음).
    setPage(next)
    afterRenderSettles(() => attemptFlip(next, nextIndex, 0))
  }

  /**
   * 표지("시작하기")에서 다음 페이지로 넘어가는, 마운트 직후 첫 페이지 전환에서
   * react-pageflip 내부 인스턴스가 아직 완전히 준비되기 전에 flip()이 호출되어
   * 아예 반응이 없는 경우가 있었다(getPageFlip()이 null을 반환). 그래서 준비가
   * 안 됐으면 조금 기다렸다가 다시 시도한다 - 최대 1초(100ms x 10회) 정도면
   * 충분하고, 그 이후로는 이미 여러 번 써서 안정적으로 준비되어 있다.
   *
   * flip() 호출 이후의 "제대로 도착했는지" 확인/보정은 여기서 하지 않는다 -
   * 아래 watchdog(useEffect)이 page가 바뀔 때마다, 그리고 그 뒤로도 계속
   * 주기적으로 확인해서 어긋나면 알아서 되돌린다. flip() 직후 한두 번만
   * 확인하는 방식으로는, react-pageflip이 우리와 무관한 다른 리렌더링(다른
   * 훅의 데이터 도착 등) 때문에 한참 뒤(수 초 후)에도 페이지 컬렉션을 다시
   * 로드하면서 가끔 엉뚱한 곳으로 튀는 경우까지는 못 잡았다.
   */
  const attemptFlip = (next, nextIndex, retryCount) => {
    if (nextIndex < 0) return
    const pageFlip = getPageFlip()
    if (!pageFlip) {
      if (retryCount < 10) {
        setTimeout(() => {
          if (mountedRef.current) attemptFlip(next, nextIndex, retryCount + 1)
        }, 100)
      }
      return
    }

    // 목표 페이지가 몇 장 떨어져 있든 flip()은 한 번만 호출한다 - 예전에
    // 한 장씩 순서대로 여러 번 호출했더니 오히려 너무 부산스럽고 부담스러웠다.
    pageFlip.flip(contentToFlipIndex(nextIndex))
  }

  const jumpTo = (next) => {
    const contentIndex = PAGE_ORDER.indexOf(next)
    afterRenderSettles(() => {
      const pageFlip = getPageFlip()
      if (contentIndex >= 0 && pageFlip) {
        pageFlip.turnToPage(contentToFlipIndex(contentIndex)) // 애니메이션 없이 즉시 이동
      }
    })
    setPage(next)
  }

  /**
   * 지금 page 상태가 가리키는 위치와 실제로 화면에 보이는 위치가 어긋나 있으면
   * 조용히(애니메이션 없이) 되돌린다. flip()/turnToPage() 호출 직후뿐 아니라
   * 마운트되어 있는 내내 주기적으로 계속 확인한다 - react-pageflip이 우리와
   * 무관한 리렌더링 때문에 페이지 컬렉션을 다시 로드하면서(내부 updateFromHtml)
   * 아주 가끔 엉뚱한 스프레드로 다시 표시하는 경우가, 페이지를 넘긴 직후가
   * 아니라 몇 초 뒤에도 일어날 수 있었기 때문이다. 애니메이션 도중에 되돌리면
   * 오히려 어색해 보이므로, 지금 애니메이션이 진행 중이 아닐 때만 보정한다.
   */
  useEffect(() => {
    const id = setInterval(() => {
      const pageFlip = getPageFlip()
      if (!pageFlip || typeof pageFlip.getCurrentPageIndex !== 'function') return
      const state = typeof pageFlip.getState === 'function' ? pageFlip.getState() : undefined
      const contentIndex = Math.max(PAGE_ORDER.indexOf(page), 0)
      if (state !== 'read') return // 넘기는 중이면 건드리지 않음
      const cur = pageFlip.getCurrentPageIndex()
      if (cur !== expectedCurrentPageIndex(contentIndex)) {
        pageFlip.turnToPage(contentToFlipIndex(contentIndex))
      }
    }, 700)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  /**
   * 진짜 원인을 여기서 찾았다: react-pageflip이 내부적으로 turnToPage()/show()를
   * 호출할 때마다(우리가 보정용으로 부르는 것뿐 아니라, updateFromHtml()이 "지금
   * 페이지를 다시 보여주기 위해" 내부적으로 부르는 것까지 전부) 'flip' 이벤트를
   * 그대로 발생시킨다. 예전엔 이 이벤트마다 setPage(...)로 반응했는데, 그러면
   * "그냥 같은 페이지를 다시 그렸을 뿐인" 내부 호출에도 setPage가 또 불려서
   * 리렌더링 -> react-pageflip의 children 변경 감지 effect -> updateFromHtml()
   * 재실행 -> 또 'flip' 이벤트... 로 이어지는 피드백 루프가 생겼다. 이게
   * 표지에서 "시작하기"를 누르면 엉뚱한 페이지로 넘어가던 버그의 진짜 원인이었다
   * (useBookFlip.js 상단 afterRenderSettles 주석에 적은 "충돌"은 이 루프를
   * 촉발하는 방아쇠였을 뿐, 실제로 몇 페이지나 더 튀는지는 이 루프가 몇 바퀴
   * 도는지에 달려 있었다).
   *
   * useMouseEvents={false}라 사용자가 손으로 직접 넘기는 경우는 없고, 페이지
   * 전환은 항상 flipTo/jumpTo를 통해서만 일어난다 - 그리고 그 둘 다 이미
   * setPage(next)로 낙관적으로 상태를 먼저 갱신해둔다. 즉 onFlip 이벤트에
   * 반응해서 page를 또 갱신할 실제 이유가 없다 - 오히려 위 피드백 루프의
   * 방아쇠가 될 뿐이므로 아예 반응하지 않는다.
   */
  const handleFlip = () => {}

  // 아카이브 화면 등으로 전환됐다가 돌아오면 HTMLFlipBook이 통째로 다시 마운트되면서
  // 늘 0번 페이지(표지)부터 다시 시작해버리는 문제가 있었다. 재마운트되더라도
  // 항상 지금 page 상태에 맞는 위치에서 시작하도록 인덱스를 계산해서 넘겨준다.
  const startFlipIndex = contentToFlipIndex(Math.max(PAGE_ORDER.indexOf(page), 0))

  return { page, flipBookRef, flipTo, jumpTo, handleFlip, startFlipIndex }
}
