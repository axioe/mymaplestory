import MergedStatList from '../../components/MergedStatList.jsx'

/**
 * 참고 이미지(인게임 장비창)와 같은 배치. 왼쪽엔 반지/얼굴장식류/무기류,
 * 가운데엔 캐릭터 이미지, 오른쪽엔 방어구류가 오도록 6칸 그리드로 짠다.
 * 안드로이드/타이틀은 우리 데이터에 없어서 슬롯 자체를 뺐다.
 */
export const EQUIPMENT_GRID_LAYOUT = [
  { area: 'ring1', label: '반지', slot: '반지1' },
  { area: 'forehead', label: '얼굴장식', slot: '얼굴장식' },
  { area: 'cap', label: '모자', slot: '모자' },
  { area: 'cape', label: '망토', slot: '망토' },
  { area: 'ring2', label: '반지', slot: '반지2' },
  { area: 'eyeacc', label: '눈장식', slot: '눈장식' },
  { area: 'clothes', label: '상의', slot: '상의' },
  { area: 'gloves', label: '장갑', slot: '장갑' },
  { area: 'ring3', label: '반지', slot: '반지3' },
  { area: 'earacc', label: '귀고리', slot: '귀고리' },
  { area: 'pants', label: '하의', slot: '하의' },
  { area: 'shoes', label: '신발', slot: '신발' },
  { area: 'ring4', label: '반지', slot: '반지4' },
  { area: 'pendant1', label: '펜던트', slot: '펜던트' },
  { area: 'shoulder', label: '어깨장식', slot: '어깨장식' },
  { area: 'medal', label: '훈장', slot: '훈장' },
  { area: 'belt', label: '벨트', slot: '벨트' },
  { area: 'pendant2', label: '펜던트', slot: '펜던트2' },
  { area: 'weapon', label: '무기', slot: '무기' },
  { area: 'subweapon', label: '보조무기', slot: '보조무기' },
  { area: 'emblem', label: '엠블렘', slot: '엠블렘' },
  { area: 'heart', label: '기계 심장', slot: '기계 심장' },
  { area: 'pocket', label: '포켓', slot: '포켓 아이템' },
  { area: 'badge', label: '뱃지', slot: '뱃지' },
]

/**
 * 프리셋을 아예 안 써본 캐릭터는 preset1/2/3이 전부 비어있을 수 있는데,
 * 그럴 때만 기본 장비(defaultEquipment)로 통일해서 보여준다. 프리셋을
 * 하나라도 쓰고 있다면(하나라도 데이터가 있으면) 각 버튼은 그 프리셋
 * 고유의 장비만 정직하게 보여준다 - 비어있으면 비어있는 대로.
 */
export function getPresetItems(equipment, effectivePreset) {
  if (!equipment) return []
  const hasAnyPresetData =
    (equipment.preset1?.length ?? 0) > 0 ||
    (equipment.preset2?.length ?? 0) > 0 ||
    (equipment.preset3?.length ?? 0) > 0
  const presetItems = { 1: equipment.preset1, 2: equipment.preset2, 3: equipment.preset3 }[effectivePreset]
  return hasAnyPresetData ? presetItems ?? [] : equipment.defaultEquipment ?? []
}

export function resolveEffectivePreset(equipment, selectedPreset) {
  return selectedPreset ?? equipment?.activePresetNo ?? 1
}

/**
 * 왼쪽 페이지 - 캐릭터 이미지 + 장비 그리드 + 프리셋 선택. 칸을 누르면
 * 선택 상태가 Home.jsx에 저장되고, 오른쪽 페이지(EquipmentDetailPanel)가
 * 그 선택을 보고 상세 정보를 보여준다. 제목/직업 줄은 그리드만으로도
 * 충분히 알아볼 수 있어서 뺐다.
 */
export function EquipmentSelectionPage({ equipment, characterImage, selectedPreset, onSelectPreset, selectedSlot, onSelectSlot }) {
  const effectivePreset = resolveEffectivePreset(equipment, selectedPreset)
  const items = getPresetItems(equipment, effectivePreset)
  const bySlot = new Map(items.map((item) => [item.slot, item]))

  return (
    <div className="home__level-content home__level-content--left">
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
            프리셋 {n}
            {equipment?.activePresetNo === n && <span className="home__equipment-active-badge">사용 중</span>}
          </button>
        ))}
      </div>

      <div className="home__equipment-grid">
        <div className="home__equipment-grid-character">
          {characterImage ? (
            <img src={characterImage} alt="캐릭터" />
          ) : (
            <span className="home__select-hint">캐릭터</span>
          )}
        </div>
        {EQUIPMENT_GRID_LAYOUT.map(({ area, label, slot }) => {
          const item = bySlot.get(slot)
          const isSelected = selectedSlot === slot

          return (
            <button
              key={area}
              type="button"
              className={
                'home__equipment-cell' +
                (item ? ' home__equipment-cell--filled' : '') +
                (isSelected ? ' home__equipment-cell--selected' : '')
              }
              style={{ gridArea: area }}
              onClick={() => item && onSelectSlot(isSelected ? null : slot)}
              disabled={!item}
              title={item ? item.itemName : label}
            >
              {item?.itemIcon ? (
                <img src={item.itemIcon} alt={item.itemName} />
              ) : (
                <span className="home__equipment-cell-label">{label}</span>
              )}
              {item?.starforce && Number(item.starforce) > 0 && (
                <span className="home__equipment-cell-star">★{item.starforce}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 오른쪽 페이지 - 왼쪽에서 고른 장비의 스텟/잠재능력. 이 페이지 자체는
 * 아카이브의 "장비" 카테고리 콘텐츠라서, ArchivePage 안에서 그대로
 * 호출된다(별도의 책 페이지가 아니라 archive 페이지 오른쪽 내용물).
 */
/**
 * 메이플스토리 잠재능력/아이템 테두리 등급 색상 관례를 그대로 따른다 -
 * 레어(파랑) / 에픽(보라) / 유니크(금색) / 레전드리(초록). NULL(없음)은
 * 색을 따로 안 준다. "레전더리"/"레전드리" 두 표기 다 대응한다.
 */
function potentialGradeClass(grade) {
  switch (grade) {
    case '레어':
      return ' home__equipment-potential-label--rare'
    case '에픽':
      return ' home__equipment-potential-label--epic'
    case '유니크':
      return ' home__equipment-potential-label--unique'
    case '레전더리':
    case '레전드리':
      return ' home__equipment-potential-label--legendary'
    default:
      return ''
  }
}

export default function EquipmentDetailPanel({ equipment, selectedPreset, selectedSlot }) {
  const effectivePreset = resolveEffectivePreset(equipment, selectedPreset)
  const items = getPresetItems(equipment, effectivePreset)
  const bySlot = new Map(items.map((item) => [item.slot, item]))
  const selectedItem = selectedSlot ? bySlot.get(selectedSlot) : null

  return (
    <div className="home__equipment-detail home__equipment-detail--standalone">
      {!selectedItem ? (
        <p className="home__select-hint">왼쪽 페이지에서 장비를 눌러서 스텟과 잠재능력을 확인해보세요.</p>
      ) : (
        <>
          <p className="home__equipment-detail-name">
            {selectedItem.itemName}
            {selectedItem.starforce && Number(selectedItem.starforce) > 0 && (
              <span className="home__equipment-starforce">★{selectedItem.starforce}</span>
            )}
            <span className="home__equipment-detail-slot home__equipment-detail-slot--inline">
              {selectedItem.slot}
            </span>
          </p>

          {selectedItem.statLines?.length > 0 && (
            <div className="home__equipment-potential">
              <p className="home__equipment-potential-label">스텟</p>
              <MergedStatList lines={selectedItem.statLines} />
            </div>
          )}
          {selectedItem.potentialLines?.length > 0 && (
            <div className="home__equipment-potential">
              <p className={'home__equipment-potential-label' + potentialGradeClass(selectedItem.potentialGrade)}>
                잠재능력 ({selectedItem.potentialGrade || '-'})
              </p>
              <MergedStatList lines={selectedItem.potentialLines} />
            </div>
          )}
          {selectedItem.additionalPotentialLines?.length > 0 && (
            <div className="home__equipment-potential">
              <p
                className={
                  'home__equipment-potential-label' + potentialGradeClass(selectedItem.additionalPotentialGrade)
                }
              >
                에디셔널 잠재능력 ({selectedItem.additionalPotentialGrade || '-'})
              </p>
              <MergedStatList lines={selectedItem.additionalPotentialLines} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
