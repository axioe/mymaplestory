/**
 * 보스 난이도별 주간/일일/월간 구분과 결정석 가격(메소) 참고 표.
 * 넥슨 API가 내려주는 cycle 필드가 실제로는 신뢰할 수 없어서(일부 부정확),
 * 사용자가 직접 정리해준 자료를 기준으로 삼는다.
 * 키 형식: "보스명|난이도"(난이도는 영문 소문자: easy/normal/hard/chaos/extreme)
 * 이 표에 없는 보스/난이도 조합이 나오면 넥슨 API의 cycle 값으로 대체한다.
 */
export const BOSS_CYCLE_DATA = {
  '자쿰|easy': { cycle: 'daily', price: 114000 },
  '자쿰|normal': { cycle: 'daily', price: 349000 },
  '자쿰|chaos': { cycle: 'weekly', price: 8080000 },
  '매그너스|easy': { cycle: 'daily', price: 411000 },
  '매그너스|normal': { cycle: 'daily', price: 1160000 },
  '매그너스|hard': { cycle: 'weekly', price: 8560000 },
  '힐라|normal': { cycle: 'daily', price: 455000 },
  '힐라|hard': { cycle: 'daily', price: 1280000 },
  '카웅|normal': { cycle: 'daily', price: 712000 },
  '파풀라투스|easy': { cycle: 'daily', price: 390000 },
  '파풀라투스|normal': { cycle: 'daily', price: 1200000 },
  '파풀라투스|chaos': { cycle: 'weekly', price: 13100000 },
  '피에르|normal': { cycle: 'daily', price: 511000 },
  '피에르|chaos': { cycle: 'weekly', price: 8170000 },
  '반반|normal': { cycle: 'daily', price: 551000 },
  '반반|chaos': { cycle: 'weekly', price: 8150000 },
  '블러디퀸|normal': { cycle: 'daily', price: 551000 },
  '블러디퀸|chaos': { cycle: 'weekly', price: 8140000 },
  '벨룸|normal': { cycle: 'daily', price: 551000 },
  '벨룸|chaos': { cycle: 'weekly', price: 9280000 },
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
  '스우|normal': { cycle: 'weekly', price: 16700000 },
  '스우|hard': { cycle: 'weekly', price: 51500000 },
  '스우|extreme': { cycle: 'weekly', price: 574000000 },
  '데미안|normal': { cycle: 'weekly', price: 17500000 },
  '데미안|hard': { cycle: 'weekly', price: 48900000 },
  '가디언 엔젤 슬라임|normal': { cycle: 'weekly', price: 25500000 },
  '가디언 엔젤 슬라임|hard': { cycle: 'weekly', price: 75100000 },
  // chaos는 표에 없어서 API의 cycle 값으로 대체되며 daily로 잘못 분류되고 있었다.
  // 실제로는 주간 콘텐츠라 여기 추가했다 - 정확한 가격은 아직 확인 못 해서 null로
  // 둔다(화면엔 가격 없이 난이도만 표시됨). 확인되면 숫자만 채우면 된다.
  '가디언 엔젤 슬라임|chaos': { cycle: 'weekly', price: null },
  '루시드|easy': { cycle: 'weekly', price: 29800000 },
  '루시드|normal': { cycle: 'weekly', price: 35600000 },
  '루시드|hard': { cycle: 'weekly', price: 62900000 },
  '윌|easy': { cycle: 'weekly', price: 32300000 },
  '윌|normal': { cycle: 'weekly', price: 41100000 },
  '윌|hard': { cycle: 'weekly', price: 77100000 },
  '더스크|normal': { cycle: 'weekly', price: 44000000 },
  '더스크|chaos': { cycle: 'weekly', price: 69800000 },
  '진 힐라|normal': { cycle: 'weekly', price: 71200000 },
  '진 힐라|hard': { cycle: 'weekly', price: 106000000 },
  '듄켈|normal': { cycle: 'weekly', price: 47500000 },
  '듄켈|hard': { cycle: 'weekly', price: 94400000 },
  '선택받은 세렌|normal': { cycle: 'weekly', price: 239000000 },
  '선택받은 세렌|hard': { cycle: 'weekly', price: 356000000 },
  '선택받은 세렌|extreme': { cycle: 'weekly', price: 2835000000 },
  '감시자 칼로스|easy': { cycle: 'weekly', price: 280000000 },
  '감시자 칼로스|normal': { cycle: 'weekly', price: 505000000 },
  '감시자 칼로스|chaos': { cycle: 'weekly', price: 1273000000 },
  '감시자 칼로스|extreme': { cycle: 'weekly', price: 4104000000 },
  '카링|easy': { cycle: 'weekly', price: 377000000 },
  '카링|normal': { cycle: 'weekly', price: 678000000 },
  '카링|hard': { cycle: 'weekly', price: 1739000000 },
  '카링|extreme': { cycle: 'weekly', price: 5387000000 },
  '림보|normal': { cycle: 'weekly', price: 1026000000 },
  '림보|hard': { cycle: 'weekly', price: 2385000000 },
  '발드릭스|normal': { cycle: 'weekly', price: 1368000000 },
  '발드릭스|hard': { cycle: 'weekly', price: 3078000000 },
  '최초의 대적자|easy': { cycle: 'weekly', price: 308000000 },
  '최초의 대적자|normal': { cycle: 'weekly', price: 560000000 },
  '최초의 대적자|hard': { cycle: 'weekly', price: 1435000000 },
  '최초의 대적자|extreme': { cycle: 'weekly', price: 4712000000 },
  '찬란한 흉성|normal': { cycle: 'weekly', price: 625000000 },
  '찬란한 흉성|hard': { cycle: 'weekly', price: 2678000000 },
  '유피테르|normal': { cycle: 'weekly', price: 1615000000 },
  '유피테르|hard': { cycle: 'weekly', price: 4845000000 },
  '시즌 보스 메이린|normal': { cycle: 'weekly', price: 300000000 },
  '시즌 보스 메이린|hard': { cycle: 'weekly', price: 600000000 },
  '검은 마법사|hard': { cycle: 'monthly', price: 665000000 },
  '검은 마법사|extreme': { cycle: 'monthly', price: 8740000000 },
}

export function lookupBossCycle(bossName, difficulty) {
  const key = `${bossName}|${(difficulty ?? '').toLowerCase()}`
  return BOSS_CYCLE_DATA[key] ?? null
}

/**
 * 표 전체를 {contentName, difficulty, cycle, price} 배열로 펼쳐준다.
 * 넥슨 스케줄러 API의 bossContents는 캐릭터별로 "주간 결정석 대상"만 내려주고
 * 저난이도(일일로 반복 가능한) 보스는 아예 안 담아서 주는 것으로 보여서,
 * 이제 보스 목록 자체는 API가 아니라 이 표를 기준으로 만든다.
 */
export function getBossListFromTable() {
  return Object.entries(BOSS_CYCLE_DATA).map(([key, value]) => {
    const [contentName, difficulty] = key.split('|')
    return { contentName, difficulty, cycle: value.cycle, price: value.price }
  })
}
