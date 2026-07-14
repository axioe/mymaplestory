export default function TickDivider({ width = 300 }) {
  return (
    <svg width={width} height="14" viewBox={`0 0 ${width} 14`} fill="none">
      <line x1="4" y1="4" x2="4" y2="10" stroke="var(--color-ink)" strokeWidth="3" />
      <line x1="2" y1="7" x2={width - 2} y2="7" stroke="var(--color-ink)" strokeWidth="2.5" />
      <line x1={width - 4} y1="4" x2={width - 4} y2="10" stroke="var(--color-ink)" strokeWidth="3" />
    </svg>
  )
}
