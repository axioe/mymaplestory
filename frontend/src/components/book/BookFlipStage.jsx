import Book from '../Book.jsx'
import '../../css/book-flip-stage.css'

/**
 * 3개 레이어(base/left/right)로 "절반만 넘어가는" 책 페이지 애니메이션을 구현한다.
 * 실제 페이지별 콘텐츠는 renderPageContent(pageKey)가 결정한다 - 이 컴포넌트는
 * 애니메이션 메커니즘만 담당하고 어떤 페이지가 무슨 내용인지는 모른다.
 */
export default function BookFlipStage({ maxWidth, page, pendingPage, flipping, introPlaying, renderPageContent }) {
  return (
    <section className="home">
      <div className={'home__flip-stage' + (introPlaying ? ' home__flip-stage--intro' : '')}>
        <div className="home__flip-base">
          <Book maxWidth={maxWidth}>{renderPageContent(flipping ? pendingPage : page)}</Book>
        </div>
        <div className="home__flip-left">
          <Book maxWidth={maxWidth}>{renderPageContent(page)}</Book>
        </div>
        <div className={'home__flip-right' + (flipping ? ' home__flip-right--turning' : '')}>
          <Book maxWidth={maxWidth}>{renderPageContent(page)}</Book>
        </div>
      </div>
    </section>
  )
}
