import { useEffect, useState } from 'react'
import '../../css/notice-ticker.css'

/**
 * 한 줄씩 보여주다가 일정 시간이 지나면 자동으로 다음 항목으로 슬라이드된다.
 * key를 항목마다 다르게 줘서, 바뀔 때마다 React가 새로 마운트하고
 * 그 덕분에 CSS 애니메이션(slide-down)이 매번 처음부터 재생된다.
 */
export default function NoticeTicker({ items, intervalMs = 6000 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
    if (!items || items.length <= 1) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [items, intervalMs])

  if (!items || items.length === 0) {
    return <p className="home__select-hint">지금은 표시할 항목이 없어요.</p>
  }

  const current = items[index % items.length]

  return (
    <div className="home__notice-ticker">
      <a
        key={current.noticeId ?? current.title}
        href={current.url}
        target="_blank"
        rel="noreferrer"
        className="home__notice-ticker-item"
      >
        {current.title}
      </a>
    </div>
  )
}
