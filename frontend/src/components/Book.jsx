/**
 * 참고 디자인(스캘럽 상단 + 층진 페이지 + 하단 검정 책등)을 재현한
 * 재사용 가능한 "열린 책" 틀 컴포넌트.
 * children은 책 안쪽 크림색 페이지 영역 위에 절대좌표로 얹힌다.
 */
import '../css/book.css'

const VB_W = 860
const VB_H = 640

function bookOutlinePath(x, y, w, h, r, dip, hump) {
  const cx = x + w / 2
  const topY = y
  return `
    M ${x + r} ${topY}
    C ${x + w * 0.18} ${topY - hump} ${cx - w * 0.06} ${topY + dip - hump * 0.25} ${cx} ${topY + dip}
    C ${cx + w * 0.06} ${topY + dip - hump * 0.25} ${x + w * 0.82} ${topY - hump} ${x + w - r} ${topY}
    A ${r} ${r} 0 0 1 ${x + w} ${topY + r}
    L ${x + w} ${y + h - r}
    A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}
    L ${x + r} ${y + h}
    A ${r} ${r} 0 0 1 ${x} ${y + h - r}
    L ${x} ${topY + r}
    A ${r} ${r} 0 0 1 ${x + r} ${topY}
    Z
  `
}

export default function Book({ maxWidth = 900, children }) {
  const x = 40
  const y = 46
  const w = VB_W - x * 2 - 24
  const h = VB_H - y - 60
  const r = 26
  const dip = 46
  const hump = 14

  const mainPath = bookOutlinePath(x, y, w, h, r, dip, hump)

  // 뒤로 살짝 겹쳐 보이는 층진 페이지 효과
  const layer2 = bookOutlinePath(x - 10, y + 10, w, h, r, dip, hump)
  const layer1 = bookOutlinePath(x - 18, y + 18, w, h, r, dip, hump)

  const spineW = 90
  const spineX = VB_W / 2 - spineW / 2
  const spineY = y + h - 6

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="book-svg"
      style={{ '--book-max-width': `${maxWidth}px` }}
    >
      <path d={layer1} fill="var(--color-page)" stroke="var(--color-line)" strokeWidth="3" />
      <path d={layer2} fill="var(--color-page)" stroke="var(--color-line)" strokeWidth="3" />

      {/* 책등(spine) */}
      <rect x={spineX} y={spineY} width={spineW} height="34" rx="10" fill="var(--color-line)" />

      <path d={mainPath} fill="var(--color-page)" stroke="var(--color-line)" strokeWidth="4.5" />

      <foreignObject x={x + 16} y={y + 16} width={w - 32} height={h - 32}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="book-svg__content"
        >
          {children}
        </div>
      </foreignObject>
    </svg>
  )
}
