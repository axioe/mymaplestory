/**
 * 보스 난이도별 주간/일일/월간 구분, 결정석 가격(메소), 주간 보스의 지역 분류
 * (메이플월드/아케인/그란디스) 참고 표. 사용자가 직접 정리해준 자료를 기준으로
 * 삼는다. 넥슨 스케줄러 API는 캐릭터 기준 "주간 결정석 대상"만 내려주고
 * 저난이도(일일) 보스는 아예 안 담아서 줘서, 보스 목록 자체를 이 표에서
 * 만든다 (bossHelpers.js의 getBossListFromTable 참고).
 * 키 형식: "보스명|난이도"(난이도는 영문 소문자: easy/normal/hard/chaos/extreme)
 * region은 주간(+월간) 보스에만 있고, 일일 보스는 지역 구분이 없다.
 */
export const BOSS_CYCLE_DATA = {
  '자쿰|easy': { cycle: 'daily', price: 114000 },
  '자쿰|normal': { cycle: 'daily', price: 349000 },
  '자쿰|chaos': { cycle: 'weekly', price: 8080000, region: 'maple' },
  '매그너스|easy': { cycle: 'daily', price: 411000 },
  '매그너스|normal': { cycle: 'daily', price: 1160000 },
  '매그너스|hard': { cycle: 'weekly', price: 8560000, region: 'maple' },
  '힐라|normal': { cycle: 'daily', price: 455000 },
  '힐라|hard': { cycle: 'daily', price: 1280000 },
  '카웅|normal': { cycle: 'daily', price: 712000 },
  '파풀라투스|easy': { cycle: 'daily', price: 390000 },
  '파풀라투스|normal': { cycle: 'daily', price: 1200000 },
  '파풀라투스|chaos': { cycle: 'weekly', price: 13100000, region: 'maple' },
  '피에르|normal': { cycle: 'daily', price: 511000 },
  '피에르|chaos': { cycle: 'weekly', price: 8170000, region: 'maple' },
  '반반|normal': { cycle: 'daily', price: 551000 },
  '반반|chaos': { cycle: 'weekly', price: 8150000, region: 'maple' },
  '블러디퀸|normal': { cycle: 'daily', price: 551000 },
  '블러디퀸|chaos': { cycle: 'weekly', price: 8140000, region: 'maple' },
  '벨룸|normal': { cycle: 'daily', price: 551000 },
  '벨룸|chaos': { cycle: 'weekly', price: 9280000, region: 'maple' },
  '반 레온|easy': { cycle: 'daily', price: 602000 },
  '반 레온|normal': { cycle: 'daily', price: 830000 },
  '반 레온|hard': { cycle: 'daily', price: 1070000 },
  '혼테일|easy': { cycle: 'daily', price: 502000 },
  '혼테일|normal': { cycle: 'daily', price: 576000 },
  '혼테일|chaos': { cycle: 'daily', price: 770000 },
  '아카이럼|easy': { cycle: 'daily', price: 656000 },
  '아카이럼|normal': { cycle: 'daily', price: 1110000 },
  '핑크빈|normal': { cycle: 'daily', price: 799000 },
  '핑크빈|chaos': { cycle: 'daily', price: 1320000 },
  '시그너스|normal': { cycle: 'daily', price: 1360000 },
  '스우|normal': { cycle: 'weekly', price: 16700000, region: 'maple' },
  '스우|hard': { cycle: 'weekly', price: 51500000, region: 'maple' },
  '스우|extreme': { cycle: 'weekly', price: 574000000, region: 'maple' },
  '데미안|normal': { cycle: 'weekly', price: 17500000, region: 'maple' },
  '데미안|hard': { cycle: 'weekly', price: 48900000, region: 'maple' },
  '가디언 엔젤 슬라임|normal': { cycle: 'weekly', price: 25500000, region: 'maple' },
  '루시드|easy': { cycle: 'weekly', price: 29800000, region: 'arcane' },
  '루시드|normal': { cycle: 'weekly', price: 35600000, region: 'arcane' },
  '루시드|hard': { cycle: 'weekly', price: 62900000, region: 'arcane' },
  '윌|easy': { cycle: 'weekly', price: 32300000, region: 'arcane' },
  '윌|normal': { cycle: 'weekly', price: 41100000, region: 'arcane' },
  '윌|hard': { cycle: 'weekly', price: 77100000, region: 'arcane' },
  '더스크|normal': { cycle: 'weekly', price: 44000000, region: 'arcane' },
  '더스크|chaos': { cycle: 'weekly', price: 69800000, region: 'arcane' },
  '진 힐라|normal': { cycle: 'weekly', price: 71200000, region: 'arcane' },
  '진 힐라|hard': { cycle: 'weekly', price: 106000000, region: 'arcane' },
  '듄켈|normal': { cycle: 'weekly', price: 47500000, region: 'arcane' },
  '듄켈|hard': { cycle: 'weekly', price: 94400000, region: 'arcane' },
  '선택받은 세렌|normal': { cycle: 'weekly', price: 239000000, region: 'grandis' },
  '선택받은 세렌|hard': { cycle: 'weekly', price: 356000000, region: 'grandis' },
  '선택받은 세렌|extreme': { cycle: 'weekly', price: 2835000000, region: 'grandis' },
  '감시자 칼로스|easy': { cycle: 'weekly', price: 280000000, region: 'grandis' },
  '감시자 칼로스|normal': { cycle: 'weekly', price: 505000000, region: 'grandis' },
  '감시자 칼로스|chaos': { cycle: 'weekly', price: 1273000000, region: 'grandis' },
  '감시자 칼로스|extreme': { cycle: 'weekly', price: 4104000000, region: 'grandis' },
  '카링|easy': { cycle: 'weekly', price: 377000000, region: 'grandis' },
  '카링|normal': { cycle: 'weekly', price: 678000000, region: 'grandis' },
  '카링|hard': { cycle: 'weekly', price: 1739000000, region: 'grandis' },
  '카링|extreme': { cycle: 'weekly', price: 5387000000, region: 'grandis' },
  '림보|normal': { cycle: 'weekly', price: 1026000000, region: 'grandis' },
  '림보|hard': { cycle: 'weekly', price: 2385000000, region: 'grandis' },
  '발드릭스|normal': { cycle: 'weekly', price: 1368000000, region: 'grandis' },
  '발드릭스|hard': { cycle: 'weekly', price: 3078000000, region: 'grandis' },
  '최초의 대적자|easy': { cycle: 'weekly', price: 308000000, region: 'grandis' },
  '최초의 대적자|normal': { cycle: 'weekly', price: 560000000, region: 'grandis' },
  '최초의 대적자|hard': { cycle: 'weekly', price: 1435000000, region: 'grandis' },
  '최초의 대적자|extreme': { cycle: 'weekly', price: 4712000000, region: 'grandis' },
  '찬란한 흉성|normal': { cycle: 'weekly', price: 625000000, region: 'grandis' },
  '찬란한 흉성|hard': { cycle: 'weekly', price: 2678000000, region: 'grandis' },
  '유피테르|normal': { cycle: 'weekly', price: 1615000000, region: 'grandis' },
  '유피테르|hard': { cycle: 'weekly', price: 4845000000, region: 'grandis' },
  '시즌 보스 메이린|normal': { cycle: 'weekly', price: 300000000, region: 'maple' },
  '시즌 보스 메이린|hard': { cycle: 'weekly', price: 600000000, region: 'maple' },
  '검은 마법사|hard': { cycle: 'monthly', price: 665000000, region: 'arcane' },
  '검은 마법사|extreme': { cycle: 'monthly', price: 8740000000, region: 'arcane' },
  // 이전 넥슨 API 응답으로 실존이 확인됐으나 이번 엑셀엔 없는 항목 - hard로
  // 잘못 들어가 있던 메소 값을 실제 난이도인 chaos로 옮겼다.
  '가디언 엔젤 슬라임|chaos': { cycle: 'weekly', price: 75100000, region: 'maple' },
}

export function lookupBossCycle(bossName, difficulty) {
  const key = `${bossName}|${(difficulty ?? '').toLowerCase()}`
  return BOSS_CYCLE_DATA[key] ?? null
}

/**
 * 표 전체를 {contentName, difficulty, cycle, price, region} 배열로 펼쳐준다.
 */
export function getBossListFromTable() {
  return Object.entries(BOSS_CYCLE_DATA).map(([key, value]) => {
    const [contentName, difficulty] = key.split('|')
    return { contentName, difficulty, cycle: value.cycle, price: value.price, region: value.region ?? null }
  })
}
