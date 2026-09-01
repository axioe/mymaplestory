import { getPresetItems, resolveEffectivePreset } from './EquipmentPage.jsx'
import '../../../css/home-archive-shared.css'
import '../../../css/home-equipment.css'

/**
 * 왼쪽 페이지 - 캐릭터 미리보기 + 코디 프리셋 선택. 인게임 "코디 프리셋" 창(캐릭터
 * 미리보기가 왼쪽, 장비 목록이 오른쪽인 배치)을 참고해서 장비 카테고리와 같은
 * 왼쪽=선택 / 오른쪽=목록 구조로 맞췄다. 다만 넥슨 API는 프리셋별로 렌더링된
 * 캐릭터 이미지를 따로 안 주고(장비창처럼 "지금 실제로 입은 모습" 이미지 하나만
 * 내려준다), 그래서 프리셋 버튼을 바꿔도 미리보기 이미지 자체는 바뀌지 않는다 -
 * 오른쪽 목록만 프리셋에 맞게 바뀐다.
 */
export function CashItemSelectionPage({ cashItem, characterImage, selectedPreset, onSelectPreset }) {
  const effectivePreset = resolveEffectivePreset(cashItem, selectedPreset)

  return (
    <div className="home__level-content home__level-content--left">
      <h2 className="display home__select-title">캐시 아이템</h2>

      <div className="home__cash-character">
        {characterImage ? (
          <img src={characterImage} alt="캐릭터" />
        ) : (
          <span className="home__select-hint">캐릭터</span>
        )}
      </div>

      <div className="home__scheduler-nav">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSelectPreset(n)}
            className={
              'home__scheduler-nav-button home__scheduler-nav-button--equipment' +
              (effectivePreset === n ? ' home__scheduler-nav-button--active' : '')
            }
          >
            코디 {n}
            {cashItem?.activePresetNo === n && <span className="home__equipment-active-badge">사용 중</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * 캐시 아이템 목록 한 줄 - 아이콘 + 이름을 가로로 긴 직사각형 행으로 보여준다.
 * 유효기간이 있으면 오른쪽 끝에 만료일을 같이 보여준다.
 */
function CashItemRow({ item }) {
  return (
    <div className="home__cash-list-item">
      <div className="home__cash-list-icon">
        {item.itemIcon && <img src={item.itemIcon} alt={item.itemName} />}
      </div>
      <div className="home__cash-list-info">
        <p className="home__cash-list-name">{item.itemName}</p>
        <p className="home__cash-list-part">{item.part}</p>
      </div>
      {item.dateExpire && <p className="home__cash-list-expire">{item.dateExpire.slice(0, 10)}까지</p>}
    </div>
  )
}

/**
 * 오른쪽 페이지 - 왼쪽에서 고른 코디 프리셋의 장착 캐시 아이템 목록. 장비 개요
 * ("장비" 카테고리)에서 "코디 확인" 버튼을 누르면 진짜 책 페이지로 넘어와서
 * 여기로 들어온다(boss-daily/scheduler-daily와 같은 방식). 제목/프리셋 선택은
 * 왼쪽 페이지(CashItemSelectionPage)로 옮겼으므로 여기는 목록만 보여준다.
 */
export default function CashItemPanel({ cashItem, selectedPreset, onBack }) {
  const effectivePreset = resolveEffectivePreset(cashItem, selectedPreset)
  const items = getPresetItems(cashItem, effectivePreset)

  return (
    <>
      <div className="home__level-content home__level-content--stats">
        {items.length === 0 ? (
          <p className="home__select-hint">이 코디 프리셋에는 장착한 캐시 아이템이 없어요.</p>
        ) : (
          <div className="home__cash-list">
            {items.map((item) => (
              <CashItemRow key={item.slot} item={item} />
            ))}
          </div>
        )}
      </div>

      <button onClick={onBack} className="home__archive-back home__archive-back--standalone">
        ← 장비로
      </button>
    </>
  )
}
