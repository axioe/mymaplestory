import '../../css/home-shared.css'
import '../../css/home-archive.css'

/**
 * 예전엔 "유니온 정보" 버튼을 눌러야 별도 책 페이지(union-info)로 넘어가서
 * 보였는데, 요청에 따라 버튼 없이 유니온 카테고리에 들어오는 즉시 보이게
 * 바꿨다. archive-union 페이지의 왼쪽 슬롯에 고정으로 렌더링된다.
 */
export default function UnionInfoPage({ union, loading, error }) {
  return (
    <div className="home__level-content home__level-content--stats">
      <h2 className="display home__select-title">유니온 정보</h2>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="home__apikey-error">{error}</p>}

      {!loading && !error && union && (
        <div className="home__level-summary">
          <div className="home__level-summary-row">
            <span className="home__level-summary-label">유니온 레벨</span>
            <span className="home__level-summary-value">{union.unionLevel}</span>
          </div>
          <div className="home__level-summary-row">
            <span className="home__level-summary-label">등급</span>
            <span className="home__level-summary-value">{union.unionGrade}</span>
          </div>
          <div className="home__level-summary-row">
            <span className="home__level-summary-label">아티팩트 레벨</span>
            <span className="home__level-summary-value">{union.unionArtifactLevel}</span>
          </div>
        </div>
      )}
    </div>
  )
}
