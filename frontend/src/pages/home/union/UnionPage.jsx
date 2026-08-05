import '../../../css/home-shared.css'
import '../../../css/home-archive-shared.css'
import '../../../css/home-union.css'
import { mergeUnionStatLines } from '../../../utils/mergeUnionStats.js'
import MergedStatList from '../../../components/MergedStatList.jsx'

const PAGE_LABEL = { raider: '공격대', artifact: '아티팩트', champion: '유니온 챔피언' }

/**
 * 유니온 개요(아카이브 안)에서 버튼을 누르면, 진짜 책 페이지로 실제 책장
 * 넘김이 일어나서 여기로 온다 - 보스/스케줄러와 완전히 같은 방식.
 * "유니온 정보"는 이제 버튼이 아니라 유니온 카테고리에 들어오자마자 왼쪽에
 * 바로 보이므로(UnionInfoPage.jsx) 여기서는 다루지 않는다.
 */
export default function UnionDetailPage({ pageKind, unionRaider, unionArtifact, unionChampion, onBack }) {
  const mergedRaiderStats = mergeUnionStatLines(unionRaider?.raiderStats)
  const mergedTotalBadges = mergeUnionStatLines(unionChampion?.totalBadges)

  return (
    <div className="home__level-content home__level-content--stats">
      <h2 className="display home__select-title">{PAGE_LABEL[pageKind]}</h2>

      {pageKind === 'raider' && unionRaider && (
        <div className="home__union-list">
          <p className="home__select-hint">
            공격대원 효과{unionRaider.maxPoint != null && ` (최대 ${unionRaider.maxPoint}pt)`}
          </p>
          {mergedRaiderStats.length > 0 ? (
            <MergedStatList lines={mergedRaiderStats} />
          ) : (
            <p className="home__select-hint">배치된 공격대원이 없어요.</p>
          )}
        </div>
      )}

      {pageKind === 'artifact' && unionArtifact && (
        <div className="home__union-list">
          {unionArtifact.crystals?.length > 0 && (
            <>
              <p className="home__union-subheading">크리스탈</p>
              <div className="home__union-crystal-grid">
                {unionArtifact.crystals.map((c) => (
                  <div key={c.name} className="home__union-crystal-card">
                    <p className="home__boss-group-name">
                      {c.name} (Lv.{c.level})
                    </p>
                    <MergedStatList lines={c.options} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {pageKind === 'champion' && unionChampion && (
        <div className="home__union-list">
          {mergedTotalBadges.length > 0 ? (
            <>
              <p className="home__union-subheading">전체 뱃지 합계</p>
              <MergedStatList lines={mergedTotalBadges} />
            </>
          ) : (
            <p className="home__select-hint">등록된 챔피언이 없어요.</p>
          )}
        </div>
      )}

      <button onClick={onBack} className="home__archive-back home__archive-back--standalone home__archive-back--union">
        ← 유니온으로
      </button>
    </div>
  )
}
