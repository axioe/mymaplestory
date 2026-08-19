import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../css/modal.css'

/**
 * document.body에 직접 붙는(Portal) 범용 모달.
 *
 * react-pageflip(StPageFlip)이 페이지 넘김 애니메이션을 위해 내부적으로
 * transform을 쓰는데, transform이 걸린 조상 아래에서 position: fixed를 쓰면
 * 뷰포트가 아니라 그 조상 기준으로 위치가 잡혀버린다. 게다가 .flip-page는
 * overflow: hidden이라(BookFlipStage.jsx 참고) 페이지 안에서 그냥 렌더링하면
 * 책 영역 밖으로 잘려 보인다. 그래서 책 DOM 트리 밖(document.body)에
 * Portal로 그려서 이 문제를 아예 피한다.
 */
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    // 잠그지 않으면 모달 안(.modal-card, overflow-y: auto)을 끝까지 스크롤한 뒤에도
    // 계속 휠/터치 드래그하면 그 스크롤이 뒤 페이지(책 콘텐츠)로 새어나갔다.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기">
          ×
        </button>
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  )
}
