import '../css/category-panel.css'

/**
 * 참고 디자인 이미지3의 오른쪽 캡슐형 카테고리 패널.
 */
export default function CategoryPanel({ categories, active, onSelect }) {
  return (
    <div className="category-panel">
      <h2 className="display category-panel__title">CATEGORY</h2>

      <div className="category-panel__list">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            className={
              'category-panel__button' +
              (active === c.key ? ' category-panel__button--active' : '')
            }
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
