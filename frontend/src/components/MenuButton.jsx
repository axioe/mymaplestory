import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../ThemeContext.jsx'
import { useApiKey } from '../ApiKeyContext.jsx'
import '../css/menu-button.css'

/**
 * 전체 헤더바 없이, 우측 상단에 떠 있는 세로줄 3개 아이콘 버튼.
 * 클릭하면 다크모드 전환 / 캐릭터 검색 / API 키 초기화 메뉴가 드롭다운으로 열린다.
 */
export default function MenuButton() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const { theme, toggleTheme } = useTheme()
  const { isKeySet, clearApiKey } = useApiKey()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const goHome = () => {
    setOpen(false)
    navigate('/')
  }

  const goSearch = () => {
    setOpen(false)
    const name = window.prompt('조회할 캐릭터 닉네임을 입력하세요')
    if (name && name.trim()) {
      navigate(`/characters/${encodeURIComponent(name.trim())}`)
    }
  }

  const handleThemeToggle = () => {
    toggleTheme()
    setOpen(false)
  }

  const handleReset = () => {
    clearApiKey()
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="menu-button" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="메뉴 열기"
        aria-expanded={open}
        className="menu-button__trigger"
      >
        <span className="menu-button__bar" />
        <span className="menu-button__bar" />
        <span className="menu-button__bar" />
      </button>

      {open && (
        <div className="menu-button__dropdown">
          <button onClick={goHome} className="menu-button__item">
            홈으로
          </button>
          <button onClick={goSearch} className="menu-button__item">
            다른 캐릭터 검색
          </button>
          <button onClick={handleThemeToggle} className="menu-button__item">
            {theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
          </button>
          {isKeySet && (
            <button onClick={handleReset} className="menu-button__item menu-button__item--danger">
              API 키 초기화
            </button>
          )}
        </div>
      )}
    </div>
  )
}
