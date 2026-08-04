import { forwardRef, useEffect, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import '../../css/book-flip-stage.css'

/**
 * 책 가로:세로 비율. width/height 고정 px 값을 계속 키워왔는데, 그 값이 실제
 * 화면(뷰포트) 크기를 전혀 몰라서 화면보다 책이 커지면 아래로 밀려 보이거나
 * 잘리는 문제가 반복됐다. 그래서 이제 "비율"만 여기서 고정해두고, 실제 픽셀
 * 크기는 매번 화면 크기를 재서 계산한다 - 항상 화면 안에 맞고, 그래서
 * .home의 justify-content: center가 제대로 작동해 정중앙에 오게 된다.
 */
// page-left.png / page-right.png / apikey*.png 전부 887x887 정사각형으로
// 만들어진 이미지라, 페이지 비율도 그에 맞춰 정사각형(1:1)으로 잡는다.
// 예전엔 세로가 긴 비율(1518:1335)이라 이미지를 억지로 자르거나(cover)
// 여백을 두고 넣어야(contain) 했는데, 비율을 아예 이미지에 맞추면 그럴
// 필요 없이 이미지가 그대로 딱 맞게 채워진다.
const BOOK_ASPECT = 1 // height / width
// .home의 실제 padding(左 1rem=16px + 右 7rem=112px = 128px, book-flip-stage.css
// 참고)과 반드시 맞춰야 한다 - 여기 값이 그보다 크면 .home의 padding과 중복으로
// 여백이 잡혀서 책이 화면 중앙보다 왼쪽으로 밀려 보이는 문제가 생긴다.
const RESERVED_WIDTH = 128 + 16 // padding 128px + 그림자/테두리 여유 16px
// 위쪽 고정 아이콘/날짜 라벨 + 위아래 여백을 위해 세로로 남겨둘 공간(px)
const RESERVED_HEIGHT = 220
const MIN_BOOK_WIDTH = 320

function computeBookSize() {
  if (typeof window === 'undefined') {
    return { width: 1335, height: 1518 }
  }
  const availableWidth = Math.max(MIN_BOOK_WIDTH * 2, window.innerWidth - RESERVED_WIDTH)
  const availableHeight = Math.max(MIN_BOOK_WIDTH, window.innerHeight - RESERVED_HEIGHT)

  // width/height 프롭은 "페이지 한 장"의 크기다. 평소엔 왼쪽+오른쪽 두 페이지가
  // 나란히 펼쳐져 보이므로, 실제 화면에서 차지하는 폭은 이 값의 2배가 된다.
  // 이전엔 가용 폭 전체를 페이지 한 장 너비로 써버려서, 두 페이지를 나란히 놓을
  // 자리가 없다고 라이브러리가 판단해 표지처럼 한 페이지만 보이는 portrait
  // 모드로 자동 전환되는 문제가 있었다.
  let width = availableWidth / 2
  let height = width * BOOK_ASPECT
  if (height > availableHeight) {
    height = availableHeight
    width = height / BOOK_ASPECT
  }
  return { width: Math.round(width), height: Math.round(height) }
}

/**
 * 창 크기(리사이즈)에 맞춰 책의 실제 픽셀 크기를 다시 계산해주는 훅.
 * HTMLFlipBook에 min===max로 넘겨서, 라이브러리의 자체 stretch 계산에
 * 기대지 않고 우리가 직접 잰 값으로 정확히 고정한다.
 */
function useBookSize() {
  const [size, setSize] = useState(computeBookSize)

  useEffect(() => {
    function handleResize() {
      setSize(computeBookSize())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

/**
 * react-pageflip이 각 페이지에 ref를 넘겨줄 수 있어야 해서(내부적으로 DOM을 직접 다룸),
 * 반드시 forwardRef로 감싼 단순 div여야 한다. (라이브러리 공식 안내사항)
 *
 * blank는 "지금은 빈 페이지"라는 뜻의 스타일 수식자일 뿐이다 - 예전엔 빈 페이지와
 * 콘텐츠 있는 페이지를 아예 다른 컴포넌트(BlankPage vs Page)로 렌더링했는데,
 * 같은 자리(예: 아카이브 페이지의 왼쪽 짝)가 카테고리에 따라 빈 페이지였다가
 * 콘텐츠가 생기기도 하면서, 매번 다른 컴포넌트 타입으로 바뀌어버려 react-pageflip이
 * 이미 직접 옮겨놓은 DOM 노드를 React가 지우거나 다시 끼워넣으려다가
 * "removeChild/insertBefore - not a child of this node" 에러로 충돌했다.
 * 항상 같은 Page 컴포넌트(같은 div)를 쓰고 내용/클래스만 바꾸면 이 문제가 없다.
 *
 * left는 "이 자리가 왼쪽 슬롯인지"를 나타낸다 - blank(내용 유무)와는 별개다.
 * 왼쪽 슬롯은 비어있을 때도, 실제 콘텐츠(보스 선택 목록 등)가 들어있을 때도
 * 항상 "왼쪽 페이지 배경 이미지"(제본선이 오른쪽에 그려진 이미지)를 써야
 * 책이 자연스럽게 이어져 보인다. blank로만 구분하면 콘텐츠가 채워진 왼쪽
 * 페이지가 오른쪽 페이지용 이미지를 잘못 쓰게 되는 문제가 있었다.
 */
const Page = forwardRef(function Page({ children, blank = false, left = false }, ref) {
  return (
    <div
      className={'flip-page' + (blank ? ' flip-page--blank' : '') + (left ? ' flip-page--left' : '')}
      ref={ref}
    >
      {children}
    </div>
  )
})

/**
 * StPageFlip(react-pageflip)으로 실제 종이가 휘어지는 듯한 페이지 넘김을 구현한다.
 * 회전/곡선/그림자 애니메이션은 전부 라이브러리가 처리하고, 여기서는
 * "어떤 페이지들이 있고 각 페이지에 어떤 내용을 넣을지"만 결정한다.
 *
 * 첫 페이지(표지)는 showCover={true}로 단독으로 보여주고, 그 다음부터는
 * 콘텐츠 페이지 하나마다 앞에 빈 페이지를 하나씩 끼워 넣는다. 화면이 넓어서
 * 두 페이지가 나란히 보일 때도 표지는 혼자, 이후로는 항상
 * "왼쪽 = 공백, 오른쪽 = 실제 콘텐츠" 조합만 나오게 하기 위함이다.
 * (pageKeys[0]은 표지로 취급하고, 나머지는 전부 빈 페이지와 짝지어 렌더링한다.)
 *
 * renderLeftPageContent(key)는 선택적이다 - 기본적으로는 왼쪽이 계속 빈 페이지이지만,
 * 특정 페이지(예: 보스 상세)에서는 왼쪽에도 실제 콘텐츠(선택 목록)를 넣고 싶을 때
 * null이 아닌 값을 반환하면 그 자리의 Page가 blank=false로 바뀌어 콘텐츠를 보여준다.
 *
 * useMouseEvents는 일부러 껐다 - 캐릭터 선택/카드 페이지는 API 키 검증 같은
 * 실제 데이터 흐름을 거쳐야 의미가 있는 화면이라, 사용자가 손으로 마구 넘겨서
 * 검증 안 된 상태로 건너뛰는 걸 막기 위해서다. 페이지 전환은 항상 버튼 클릭
 * (flipTo 호출)을 통해서만 일어난다.
 */
export default function BookFlipStage({
  pageKeys,
  flipBookRef,
  startFlipIndex,
  onFlip,
  renderPageContent,
  renderLeftPageContent,
  overlay,
  coverOnly = false,
}) {
  const [coverKey, ...restKeys] = pageKeys
  const { width: bookWidth, height: bookHeight } = useBookSize()

  return (
    <div className={'book-flip-wrapper' + (coverOnly ? ' book-flip-wrapper--cover-only' : '')}>
      {/* .flip-page는 overflow: hidden이라 그 안에 넣으면 카테고리 탭처럼 책
          바깥으로 튀어나오는 요소가 잘려 보였다. 여기(.book-flip-wrapper,
          overflow 제한 없음)에 형제로 렌더링해서, 책의 실제 렌더링 크기
          기준으로 밖으로 자연스럽게 튀어나올 수 있게 한다. */}
      {overlay}
      <HTMLFlipBook
        ref={flipBookRef}
        width={bookWidth}
        height={bookHeight}
        size="stretch"
        minWidth={bookWidth}
        maxWidth={bookWidth}
        minHeight={bookHeight}
        maxHeight={bookHeight}
        showCover={true}
        usePortrait={false}
        maxShadowOpacity={0.35}
        flippingTime={700}
        useMouseEvents={false}
        startPage={startFlipIndex}
        className="flip-book"
        onFlip={(e) => onFlip(e.data)}
      >
        <Page key={coverKey}>{renderPageContent(coverKey)}</Page>
        {restKeys.flatMap((key) => {
          const leftContent = renderLeftPageContent ? renderLeftPageContent(key) : null
          return [
            <Page key={`blank-${key}`} blank={leftContent == null} left>
              {leftContent}
            </Page>,
            <Page key={key}>{renderPageContent(key)}</Page>,
          ]
        })}
      </HTMLFlipBook>
    </div>
  )
}
