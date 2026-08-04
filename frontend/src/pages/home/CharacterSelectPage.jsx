import '../../css/home-shared.css'
import '../../css/home-select.css'
import '../../css/home-archive.css'

/**
 * 검색해서 넣어둔 캐릭터가 아니라, API 키 계정에 실제로 연결된 캐릭터를
 * 월드(서버)별로 묶는다. Map을 쓰는 이유는 "API가 내려준 순서"를 그대로
 * 유지하기 위함이다.
 */
function groupByWorld(characters) {
  const groups = new Map()
  for (const c of characters) {
    if (!groups.has(c.worldName)) groups.set(c.worldName, [])
    groups.get(c.worldName).push(c)
  }
  return groups
}

/**
 * 캐릭터 개요 - 서버(월드) 버튼 목록. 계정에 캐릭터가 워낙 많을 수 있어서
 * (수십 개), 한 화면에 다 늘어놓는 대신 서버별로 몇 명인지 버튼으로 먼저
 * 보여주고, 버튼을 누르면 실제 책장이 넘어가서 그 서버의 캐릭터 목록
 * (레벨 높은 순)으로 이동한다 - 보스/스케줄러와 같은 방식.
 */
export default function CharacterSelectPage({ characters, loading, error, onSelectWorld }) {
  const groups = groupByWorld(characters ?? [])

  return (
    <div className="home__select-content">
      <h2 className="display home__select-title">캐릭터 선택</h2>
      <p className="home__select-hint">
        {loading ? '내 캐릭터 목록을 불러오는 중...' : '서버를 선택해주세요.'}
      </p>

      {error && <p className="home__apikey-error">{error}</p>}

      {!loading && !error && characters?.length === 0 && (
        <p className="home__select-hint">이 API 키에 연결된 캐릭터를 찾지 못했어요.</p>
      )}

      {!loading && !error && groups.size > 0 && (
        <div className="home__select-world-list">
          {[...groups.entries()].map(([worldName, worldCharacters]) => (
            <button
              key={worldName}
              type="button"
              onClick={() => onSelectWorld(worldName)}
              className="home__scheduler-nav-button"
            >
              {worldName}
              <span className="home__scheduler-nav-count">{worldCharacters.length}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 캐릭터 상세 - 고른 서버의 캐릭터를 레벨 높은 순으로 보여준다. onBack은
 * flipTo('select')로 실제 책장을 넘겨서 서버 선택으로 돌아간다.
 */
export function CharacterWorldDetailPage({ characters, worldName, onSelectCharacter, onBack }) {
  const worldCharacters = (characters ?? [])
    .filter((c) => c.worldName === worldName)
    .slice()
    .sort((a, b) => (b.characterLevel ?? 0) - (a.characterLevel ?? 0))

  return (
    <div className="home__select-content">
      <h2 className="display home__select-title">{worldName}</h2>
      <p className="home__select-hint">레벨 높은 순으로 정렬했어요.</p>

      <div className="home__select-list">
        {worldCharacters.map((c) => (
          <button key={c.ocid} onClick={() => onSelectCharacter(c)} className="home__select-chip">
            {c.characterName}
            <span className="home__select-chip-class">
              {c.characterClass} · Lv.{c.characterLevel}
            </span>
          </button>
        ))}
      </div>

      <button onClick={onBack} className="home__archive-back">
        ← 서버 선택으로
      </button>
    </div>
  )
}
