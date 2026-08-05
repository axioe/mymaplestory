import '../../../css/home-shared.css'
import '../../../css/home-archive.css'
import { mergeUnionStatLines } from '../../../utils/mergeUnionStats.js'
import MergedStatList from '../../../components/MergedStatList.jsx'

/**
 * "공격대" 상세 페이지(union-raider)의 왼쪽 슬롯. 예전엔 공격대원 효과와 같이
 * 오른쪽 페이지에 있었는데, 요청에 따라 "유니온 상태 스탯"만 왼쪽으로 뺐다.
 */
export default function UnionRaiderStateLeftPage({ unionRaider }) {
  const mergedStateStats = mergeUnionStatLines(unionRaider?.stateStats)

  return (
    <div className="home__level-content home__level-content--stats">
      <h2 className="display home__select-title">유니온 상태 스탯</h2>

      {mergedStateStats.length > 0 ? (
        <div className="home__union-list">
          <MergedStatList lines={mergedStateStats} />
        </div>
      ) : (
        <p className="home__select-hint">설정된 유니온 상태 스탯이 없어요.</p>
      )}
    </div>
  )
}
