import { useEffect, useState } from 'react'

export const FLIP_DURATION_MS = 1600 // css .home__flip-right 의 transition 시간과 반드시 맞출 것
export const INTRO_DURATION_MS = 1000 // css .home__flip-stage--intro 애니메이션 시간과 반드시 맞출 것

/**
 * "책 페이지를 넘기는" 화면 전환 상태를 관리하는 훅.
 * - page: 현재 확정된 페이지
 * - pendingPage: 넘어가는 중이라면 그 다음 페이지 (없으면 null)
 * - flipping: pendingPage가 있는지 여부
 * - introPlaying: 표지(start)로 처음 들어왔을 때 "접힌 책이 펼쳐지는" 인트로가 재생 중인지
 * - flipTo(next): 페이지 넘김 애니메이션을 시작하고, 끝나면 page를 next로 확정한다.
 */
export function useBookFlip(initialPage) {
  const [page, setPage] = useState(initialPage)
  const [introPlaying, setIntroPlaying] = useState(initialPage === 'start')
  const [pendingPage, setPendingPage] = useState(null)
  const flipping = pendingPage !== null

  // 인트로 애니메이션이 끝나면, 이후의 페이지 전환(플립) 애니메이션과 겹치지 않도록 떼어낸다.
  useEffect(() => {
    if (!introPlaying) return
    const timer = window.setTimeout(() => setIntroPlaying(false), INTRO_DURATION_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const flipTo = (next) => {
    setPendingPage(next)
    window.setTimeout(() => {
      setPage(next)
      setPendingPage(null)
    }, FLIP_DURATION_MS)
  }

  /** 애니메이션 없이 즉시 페이지를 바꾼다 (뒤로가기, 초기화 등). */
  const jumpTo = (next) => {
    setPendingPage(null)
    setPage(next)
  }

  return { page, pendingPage, flipping, introPlaying, flipTo, jumpTo }
}
