import '../../css/home-shared.css'
import '../../css/home-archive.css'

/**
 * "아티팩트" 상세 페이지(union-artifact)의 왼쪽 슬롯. 예전엔 크리스탈과 같이
 * 오른쪽 페이지에 있었는데, 요청에 따라 "아티팩트 효과"만 왼쪽으로 뺐다.
 */
export default function UnionArtifactEffectsLeftPage({ unionArtifact }) {
  return (
    <div className="home__level-content home__level-content--stats">
      <h2 className="display home__select-title">아티팩트 효과</h2>

      {unionArtifact?.remainAp != null && (
        <p className="home__select-hint">잔여 AP {unionArtifact.remainAp}</p>
      )}

      {unionArtifact?.effects?.length > 0 ? (
        <div className="home__union-list">
          {unionArtifact.effects.map((e) => (
            <p key={e.name} className="home__equipment-potential-line">
              {e.name} (Lv.{e.level})
            </p>
          ))}
        </div>
      ) : (
        <p className="home__select-hint">설정된 아티팩트 효과가 없어요.</p>
      )}
    </div>
  )
}
