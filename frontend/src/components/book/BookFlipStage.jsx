import { forwardRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import '../../css/book-flip-stage.css'

/**
 * react-pageflip이 각 페이지에 ref를 넘겨줄 수 있어야 해서(내부적으로 DOM을 직접 다룸),
 * 반드시 forwardRef로 감싼 단순 div여야 한다. (라이브러리 공식 안내사항)
 */
const Page = forwardRef(function Page({ children }, ref) {
  return (
    <div className="flip-page" ref={ref}>
      {children}
    </div>
  )
})

const BlankPage = forwardRef(function BlankPage(_, ref) {
  return <div className="flip-page flip-page--blank" ref={ref} />
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
 * null이 아닌 값을 반환하면 그 페이지가 <BlankPage> 대신 콘텐츠가 담긴 <Page>로 바뀐다.
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
}) {
  const [coverKey, ...restKeys] = pageKeys

  return (
    <div className="book-flip-wrapper">
      <HTMLFlipBook
        ref={flipBookRef}
        width={800}
        height={720}
        size="stretch"
        minWidth={320}
        maxWidth={1000}
        minHeight={480}
        maxHeight={880}
        showCover={true}
        usePortrait={true}
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
            leftContent != null ? (
              <Page key={`blank-${key}`}>{leftContent}</Page>
            ) : (
              <BlankPage key={`blank-${key}`} />
            ),
            <Page key={key}>{renderPageContent(key)}</Page>,
          ]
        })}
      </HTMLFlipBook>
    </div>
  )
}
