import { useNavigate } from 'react-router-dom'
import '../css/menu-button.css'

/**
 * 우측 상단 고정 버튼. 드롭다운 메뉴 없이, 클릭하면 바로 홈으로 이동한다.
 */
export default function MenuButton() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/', { state: { resetAt: Date.now() } })}
      aria-label="홈으로 이동"
      className="menu-button__trigger"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 11.5 12 4l8 7.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
