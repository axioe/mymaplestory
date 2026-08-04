const SIMPLE_STAT_RE = /^(STR|DEX|INT|LUK)\s+(\d+)\s*증가$/
// 줄 안에서 맨 처음 나오는 숫자(퍼센트 포함) 앞뒤로 "라벨"과 "수치"를 나눈다.
const VALUE_SPLIT_RE = /^(.*?)\s*(\d+(?:\.\d+)?%?.*)$/

/**
 * 유니온 스탯 텍스트 목록(mergeUnionStatLines로 이미 합쳐진 배열)을 라벨과
 * 수치를 점선으로 잇는 장부(원장) 줄 형태로 보여준다. STR/DEX/INT/LUK
 * 총합 줄만 수치 색을 스탯별로 다르게 줘서 구분한다(배지 형태는 아님).
 */
export default function MergedStatList({ lines }) {
  if (!lines || lines.length === 0) return null

  return (
    <>
      {lines.map((line, i) => {
        const stat = line.trim().match(SIMPLE_STAT_RE)?.[1]
        const match = line.match(VALUE_SPLIT_RE)
        // value 부분이 너무 길거나(15자 초과) 쉼표가 섞인 복합 문구
        // (예: "올스탯 20, 최대 HP/MP 1000 증가")는 라벨/수치로 억지로
        // 나누면 값 칸이 좁아 잘리거나 줄바꿈되므로, 그냥 한 줄로 보여준다.
        const isSimpleEnough = match && match[1] && match[2].length <= 15 && !match[2].includes(',')
        if (!isSimpleEnough) {
          return (
            <p key={i} className="home__equipment-potential-line">
              {line}
            </p>
          )
        }
        const [, label, value] = match
        return (
          <div key={i} className="home__union-ledger-row">
            <span className="home__union-ledger-label">{label}</span>
            <span
              className={'home__union-ledger-value' + (stat ? ` home__union-ledger-value--${stat}` : '')}
            >
              {value}
            </span>
          </div>
        )
      })}
    </>
  )
}
