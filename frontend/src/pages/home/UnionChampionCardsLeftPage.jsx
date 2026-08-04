import '../../css/home-shared.css'
import '../../css/home-archive.css'
import { mergeUnionStatLines } from '../../utils/mergeUnionStats.js'

/**
 * "유니온 챔피언" 상세 페이지(union-champion)의 왼쪽 슬롯. 예전엔 챔피언
 * 카드들이 전체 뱃지 합계와 같이 오른쪽 페이지에 세로로 쌓여 있었는데,
 * 요청에 따라 왼쪽으로 옮기고 3열 2행(최대 6장)의 카드 격자로 배치했다.
 */
export default function UnionChampionCardsLeftPage({ unionChampion }) {
  const champions = unionChampion?.champions ?? []

  return (
    <div className="home__level-content home__level-content--stats">
      <h2 className="display home__select-title">유니온 챔피언</h2>

      {champions.length > 0 ? (
        <div className="home__union-champion-grid">
          {champions.map((c) => (
            <div key={c.slot} className="home__union-champion-card">
              <p className="home__boss-group-name">
                {c.name} · {c.className} ({c.grade})
              </p>
              {mergeUnionStatLines(c.badges).map((b) => (
                <p key={b} className="home__equipment-potential-line">
                  {b}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="home__select-hint">등록된 챔피언이 없어요.</p>
      )}
    </div>
  )
}
