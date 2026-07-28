import { useEffect, useState } from 'react'
import '../../css/notice-ticker.css'

/**
 * 한 줄씩 보여주다가 일정 시간이 지나면 자동으로 다음 항목으로 슬라이드된다.
 * 좌우 화살표로 수동으로도 넘길 수 있고, 수동으로 넘기면 자동 전환 타이머가
 * 그 시점부터 다시 시작된다(index가 바뀔 때마다 useEffect가 새로 걸리므로).
 * key를 항목마다 다르게 줘서, 바뀔 때마다 React가 새로 마운트하고
 * 그 덕분에 CSS 애니메이션(slide-down)이 매번 처음부터 재생된다.
 */
export default function NoticeTicker({ items, intervalMs = 6000 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [items])

  useEffect(() => {
    if (!items || items.length <= 1) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [items, intervalMs, index])

  if (!items || items.length === 0) {
    return <p className="home__select-hint">지금은 표시할 항목이 없어요.</p>
  }

  const current = items[index % items.length]
  const goPrev = () => setIndex((i) => (i - 1 + items.length) % items.length)
  const goNext = () => setIndex((i) => (i + 1) % items.length)

  return (
    <div className="home__notice-ticker">
      <button
        type="button"
        onClick={goPrev}
        className="home__notice-ticker-nav"
        aria-label="이전 공지"
        disabled={items.length <= 1}
      >
        ‹
      </button>

      <a
        key={current.noticeId ?? current.title}
        href={current.url}
        target="_blank"
        rel="noreferrer"
        className="home__notice-ticker-item"
      >
        {current.title}
      </a>

      <button
        type="button"
        onClick={goNext}
        className="home__notice-ticker-nav"
        aria-label="다음 공지"
        disabled={items.length <= 1}
      >
        ›
      </button>
    </div>
  )
}
