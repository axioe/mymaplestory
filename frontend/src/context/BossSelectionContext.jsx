import { createContext, useContext } from 'react'
import { useBossSelection } from '../hooks/useBossSelection.js'

const BossSelectionContext = createContext(null)

/**
 * Home.jsx가 직접 useBossSelection()을 호출하는 대신, 이 Provider가 상태를
 * 대신 들고 있는다. Home.jsx는 이 Provider의 children으로 책 전체(JSX)를
 * "그대로" 넘겨주기만 하고 자기 자신은 bossSelection 상태를 구독하지 않으므로,
 * 보스 선택 상태가 바뀌어도 Home.jsx 자체는 다시 렌더링되지 않는다 - children으로
 * 넘어온 React 엘리먼트 참조가 그대로라 리액트가 그 서브트리를 통째로 스킵한다.
 * 실제로 이 값을 구독하는(useBossSelectionContext를 호출하는) 컴포넌트들만
 * 정상적으로 다시 렌더링된다.
 */
export function BossSelectionProvider({ characterName, children }) {
  const bossSelection = useBossSelection(characterName)
  return <BossSelectionContext.Provider value={bossSelection}>{children}</BossSelectionContext.Provider>
}

export function useBossSelectionContext() {
  const ctx = useContext(BossSelectionContext)
  if (!ctx) {
    throw new Error('useBossSelectionContext는 BossSelectionProvider 안에서만 쓸 수 있다')
  }
  return ctx
}
