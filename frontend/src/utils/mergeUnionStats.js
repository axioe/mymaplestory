/**
 * 유니온 공격대원 효과 같은 텍스트 배열은 배치된 인원 수만큼 완전히 같은
 * 문구가 반복된다 (예: "STR 80 증가"가 5번, "INT 80 증가"가 3번...).
 * 예전엔 "(×N)"처럼 몇 번 중복됐는지만 표시했는데, 요청에 따라 이제
 * "몇 번"이 아니라 "수치를 다 더한 총합" 한 줄로 보여준다.
 *
 * - STR/DEX/INT/LUK는 별도로 모아서 [INT, STR, DEX, LUK] 순서로 총합 한
 *   줄씩 맨 앞에 보여준다. "STR, DEX, LUK 40 증가"처럼 여러 스탯이 한 줄에
 *   같이 나오는 경우도 각 스탯 총합에 나눠서 더한다.
 * - 그 외의 줄들은 숫자만 빼고 나머지 문구가 완전히 같으면(템플릿이 같으면)
 *   숫자를 합산해서 한 줄로 합친다. 숫자가 없는 줄은 완전히 같은 줄끼리만
 *   하나로 합친다.
 */

const STAT_KEYS = ['INT', 'STR', 'DEX', 'LUK']

const SINGLE_STAT_RE = /^(STR|DEX|INT|LUK)\s+(\d+)\s*증가$/
const MULTI_STAT_RE = /^((?:STR|DEX|INT|LUK)(?:,\s*(?:STR|DEX|INT|LUK))+)\s+(\d+)\s*증가$/

/**
 * "이동속도, 최대 이동속도 10 증가. 최대 이동속도 170 이상 시 초과분의 20%
 * 적용, 렌 공격대원 효과로 증가하는 최대 이동속도는 190 초과 불가"처럼
 * 유독 긴 설명이 붙는 줄(렌 공격대원 고유 효과)이 있다. 상세 조건까지 다
 * 보여주면 목록이 너무 길어져서, 요청에 따라 "렌 공격대원"이라는 짧은
 * 표현으로 단순화한다.
 */
function simplifyVerboseLines(lines) {
  if (!lines) return lines
  return lines.map((line) => (line.trim().startsWith('이동속도, 최대 이동속도') ? '렌 공격대원' : line))
}

function extractStatTotals(lines) {
  const totals = { INT: 0, STR: 0, DEX: 0, LUK: 0 }
  const seen = { INT: false, STR: false, DEX: false, LUK: false }
  const rest = []

  for (const raw of lines) {
    const line = raw.trim()
    const singleMatch = line.match(SINGLE_STAT_RE)
    const multiMatch = !singleMatch && line.match(MULTI_STAT_RE)

    if (singleMatch) {
      const [, stat, amount] = singleMatch
      totals[stat] += Number(amount)
      seen[stat] = true
      continue
    }
    if (multiMatch) {
      const [, statList, amount] = multiMatch
      for (const stat of statList.split(',').map((s) => s.trim())) {
        totals[stat] += Number(amount)
        seen[stat] = true
      }
      continue
    }
    rest.push(raw)
  }

  const statLines = STAT_KEYS.filter((key) => seen[key]).map((key) => `${key} ${totals[key]} 증가`)
  return { statLines, rest }
}

// 문구 안 첫 번째 숫자(소수/퍼센트 포함)를 찾는다.
const NUMBER_RE = /\d+(?:\.\d+)?%?/

function formatSum(sum) {
  if (Number.isInteger(sum)) return String(sum)
  // 소수점은 최대 2자리까지만, 끝의 불필요한 0은 제거 (예: 20.00 -> 20, 20.50 -> 20.5)
  return sum.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function mergeRemainingLines(lines) {
  const order = []
  const groups = new Map()

  for (const line of lines) {
    const match = line.match(NUMBER_RE)
    if (!match) {
      // 숫자가 없는 줄은 완전히 같은 줄끼리만 합친다 (중복 제거).
      if (!groups.has(line)) {
        groups.set(line, { plain: true })
        order.push(line)
      }
      continue
    }

    const matchedText = match[0]
    const hasPercent = matchedText.endsWith('%')
    const numericValue = Number(hasPercent ? matchedText.slice(0, -1) : matchedText)
    // %인지 아닌지를 템플릿 키에 포함시킨다 - 안 그러면 "최대 HP 2500 증가"(고정치)와
    // "최대 HP 5% 증가"(퍼센트)처럼 단위가 다른 줄이 문구만 보고 잘못 합쳐진다.
    const template =
      line.slice(0, match.index) + '\u0000' + (hasPercent ? '%' : '#') + line.slice(match.index + matchedText.length)

    if (!groups.has(template)) {
      groups.set(template, { plain: false, template, sum: numericValue, hasPercent })
      order.push(template)
    } else {
      groups.get(template).sum += numericValue
    }
  }

  return order.map((key) => {
    const g = groups.get(key)
    if (g.plain) return key
    const marker = '\u0000' + (g.hasPercent ? '%' : '#')
    return g.template.replace(marker, formatSum(g.sum) + (g.hasPercent ? '%' : ''))
  })
}

/**
 * lines(문자열 배열)를 받아서, STR/DEX/INT/LUK 총합 라인들을 맨 앞에 두고
 * 그 외 줄들은 같은 문구끼리 숫자를 합산한 배열을 돌려준다.
 */
export function mergeUnionStatLines(lines) {
  if (!lines || lines.length === 0) return []
  const simplified = simplifyVerboseLines(lines)
  const { statLines, rest } = extractStatTotals(simplified)
  return [...statLines, ...mergeRemainingLines(rest)]
}
