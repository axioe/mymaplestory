import '../../css/home-shared.css'
import '../../css/home-archive.css'

const PAGE_LABEL = { info: '유니온 정보', raider: '공격대', artifact: '아티팩트', champion: '챔피언' }

/**
 * 유니온 개요(아카이브 안)에서 버튼 4개 중 하나를 누르면, 진짜 책 페이지로
 * 실제 책장 넘김이 일어나서 여기로 온다 - 보스/스케줄러와 완전히 같은 방식.
 */
export default function UnionDetailPage({ pageKind, union, unionRaider, unionArtifact, unionChampion, onBack }) {
  return (
    <div className="home__level-content home__level-content--stats">
      <h2 className="display home__select-title">{PAGE_LABEL[pageKind]}</h2>

      {pageKind === 'info' && union && (
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
          <div className="home__level-summary-row">
            <span className="home__level-summary-label">아티팩트 경험치</span>
            <span className="home__level-summary-value">{union.unionArtifactExp}</span>
          </div>
          <div className="home__level-summary-row">
            <span className="home__level-summary-label">아티팩트 포인트</span>
            <span className="home__level-summary-value">{union.unionArtifactPoint}</span>
          </div>
        </div>
      )}

      {pageKind === 'raider' && unionRaider && (
        <div className="home__union-list">
          <p className="home__select-hint">
            공격대원 효과{unionRaider.maxPoint != null && ` (최대 ${unionRaider.maxPoint}pt)`}
          </p>
          {unionRaider.raiderStats?.length > 0 ? (
            unionRaider.raiderStats.map((stat, i) => (
              <p key={i} className="home__equipment-potential-line">
                {stat}
              </p>
            ))
          ) : (
            <p className="home__select-hint">배치된 공격대원이 없어요.</p>
          )}
          {unionRaider.stateStats?.length > 0 && (
            <>
              <p className="home__union-subheading">유니온 상태 스탯</p>
              {unionRaider.stateStats.map((stat, i) => (
                <p key={i} className="home__equipment-potential-line">
                  {stat}
                </p>
              ))}
            </>
          )}
        </div>
      )}

      {pageKind === 'artifact' && unionArtifact && (
        <div className="home__union-list">
          <p className="home__select-hint">
            아티팩트 효과{unionArtifact.remainAp != null && ` (잔여 AP ${unionArtifact.remainAp})`}
          </p>
          {unionArtifact.effects?.map((e) => (
            <p key={e.name} className="home__equipment-potential-line">
              {e.name} (Lv.{e.level})
            </p>
          ))}
          {unionArtifact.crystals?.length > 0 && (
            <>
              <p className="home__union-subheading">크리스탈</p>
              {unionArtifact.crystals.map((c) => (
                <div key={c.name} className="home__boss-group">
                  <p className="home__boss-group-name">
                    {c.name} (Lv.{c.level})
                  </p>
                  {c.options.map((o) => (
                    <p key={o} className="home__equipment-potential-line">
                      {o}
                    </p>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {pageKind === 'champion' && unionChampion && (
        <div className="home__union-list">
          {unionChampion.champions?.length > 0 ? (
            unionChampion.champions.map((c) => (
              <div key={c.slot} className="home__boss-group">
                <p className="home__boss-group-name">
                  {c.name} · {c.className} ({c.grade})
                </p>
                {c.badges.map((b) => (
                  <p key={b} className="home__equipment-potential-line">
                    {b}
                  </p>
                ))}
              </div>
            ))
          ) : (
            <p className="home__select-hint">등록된 챔피언이 없어요.</p>
          )}
          {unionChampion.totalBadges?.length > 0 && (
            <>
              <p className="home__union-subheading">전체 뱃지 합계</p>
              {unionChampion.totalBadges.map((b) => (
                <p key={b} className="home__equipment-potential-line">
                  {b}
                </p>
              ))}
            </>
          )}
        </div>
      )}

      <button onClick={onBack} className="home__archive-back home__archive-back--standalone">
        ← 유니온으로
      </button>
    </div>
  )
}
