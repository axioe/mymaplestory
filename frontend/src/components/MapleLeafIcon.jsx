/**
 * 참고 디자인의 오렌지 단풍잎 로고를 간략화한 SVG 아이콘.
 */
export default function MapleLeafIcon({ size = 80, color = 'var(--color-accent)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 8
           C56 20 68 18 72 28
           C76 36 68 42 60 40
           C66 50 80 54 78 66
           C68 62 58 54 54 58
           C50 64 52 72 46 72
           C40 72 42 64 38 58
           C34 54 24 62 14 66
           C12 54 26 50 32 40
           C24 42 16 36 20 28
           C24 18 36 20 42 8
           C44 12 48 12 50 8 Z"
        fill={color}
      />
      <path
        d="M52 60 C58 68 62 78 60 90"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
