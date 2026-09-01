import { getPresetItems, resolveEffectivePreset } from '../equipment/EquipmentPage.jsx'
import '../../../css/home-archive-shared.css'
import '../../../css/home-cash.css'

/**
 * 캐시 장비(코디) 카드 하나 - 아이콘/이름/부위, 유효기간이 있으면 만료일까지 같이 보여준다.
 * date_expire가 "expired" 리터럴인 경우는 백엔드에서 이미 null로 정리해서 내려주므로
 * (의미가 불확실해서), 여기선 값이 있으면 항상 실제 날짜라고 믿고 그대로 보여주면 된다.
 */
function CashItemCard({ item }) {
  return (
    <div className="home__cash-card">
      <div className="home__cash-card-icon">
        {item.itemIcon && <img src={item.itemIcon} alt={item.itemName} />}
      </div>
      <p className="home__cash-card-name">{item.itemName}</p>
      <p className="home__cash-card-part">{item.part}</p>
      {item.dateExpire && <p className="home__cash-card-expire">{item.dateExpire.slice(0, 10)}까지</p>}
    </div>
  )
}

/**
 * 캐시 카테고리 콘텐츠 - 장비 카테고리와 같은 응답 모양(defaultEquipment/preset1~3,
 * activePresetNo)을 쓰도록 백엔드를 맞춰뒀기 때문에, 프리셋 선택 로직은
 * EquipmentPage.jsx의 getPresetItems/resolveEffectivePreset을 그대로 재사용한다.
 * 장비처럼 왼쪽 그리드 + 오른쪽 상세로 나누지 않고 한 페이지에 카드 그리드로
 * 보여준다 - 캐시 장비는 부위가 고정된 인게임 창 배치가 아니라 착용한 것만
 * 나오므로, 빈 칸이 있는 그리드보다 꽉 찬 카드 목록이 더 자연스럽다.
 */
export default function CashItemPanel({ cashItem, selectedPreset, onSelectPreset }) {
  const effectivePreset = resolveEffectivePreset(cashItem, selectedPreset)
  const items = getPresetItems(cashItem, effectivePreset)

  return (
    <>
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

      {items.length === 0 ? (
        <p className="home__select-hint">이 코디 프리셋에는 장착한 캐시 아이템이 없어요.</p>
      ) : (
        <div className="home__cash-grid">
          {items.map((item) => (
            <CashItemCard key={item.slot} item={item} />
          ))}
        </div>
      )}
    </>
  )
}
