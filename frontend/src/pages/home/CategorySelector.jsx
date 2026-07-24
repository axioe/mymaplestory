import '../../css/category-selector.css'

/**
 * 우측 상단 홈 아이콘 + 다크모드 토글 바로 아래에 고정되는 작은 카테고리 목록.
 * 아카이브 페이지를 보고 있을 때만 렌더링된다 (Home.jsx에서 조건부로 렌더링).
 * position: fixed라 DOM 상 어디에 있든 항상 화면 우상단에 붙는다.
 */
export default function CategorySelector({ categories, active, onSelectCategory }) {
  return (
    <div className="category-selector">
      {categories.map((c) => (
        <button
          key={c.key}
          onClick={() => onSelectCategory(c.key)}
          className={'category-selector__item' + (active === c.key ? ' category-selector__item--active' : '')}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
