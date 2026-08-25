import { getBossListFromTable } from '../data/bossCycleData.js'

/**
 * 예전엔 넥슨 스케줄러 API(scheduler.bossContents)에서 보스 목록을 가져왔는데,
 * 실제로 확인해보니 이 API는 캐릭터 기준 "주간 결정석 대상" 보스만 내려주고
 * 저난이도(일일로 반복 가능한) 보스는 아예 목록에 안 담아서 준다. 그래서
 * "일일 보스"가 항상 비어보이는 문제가 있었다.
 *
 * 그래서 이제 보스 목록 자체는 API가 아니라 사용자가 정리해준 엑셀 표
 * (bossCycleData.js)를 그대로 근거로 삼는다 - 이 표엔 일일/주간/월간 보스가
 * 전부 다 있다. cycle/가격도 표에서 바로 나오므로 API의 boss_contents는
 * 이제 이 화면(보스 카테고리)에서는 안 쓴다.
 */
export function resolveBossCycle(item) {
  return item.cycle
}

export function resolveBossPrice(item) {
  return item.price ?? null
}

export function formatMeso(price) {
  return price == null ? null : `${Math.floor(price).toLocaleString('ko-KR')}메소`
}

export function getDailyBossItems(scheduler) {
  return getValidBossContents(scheduler).filter((b) => resolveBossCycle(b) === 'daily')
}

/**
 * cycle이 주간이거나 월간인 항목 전체 (일일 제외).
 * 예전엔 지역(메이플월드/아케인/그란디스)별로 페이지를 나눠서 보여줬는데,
 * "일일보스/주간보스로만 나오게 해달라"는 요청으로 지역 구분 없이 하나의
 * 목록으로 합쳤다.
 */
export function getWeeklyLikeBossItems(scheduler) {
  return getValidBossContents(scheduler).filter((b) => {
    const c = resolveBossCycle(b)
    return c === 'weekly' || c === 'monthly'
  })
}

// 챌린저스 월드(챌린저스1~4)에서만 등장하는 시즌 전용 보스.
const CHALLENGERS_WORLDS = ['챌린저스1', '챌린저스2', '챌린저스3', '챌린저스4']
const SEASON_BOSS_MAYRIN = '시즌보스메이린' // 공백 제거 후 비교용 정규화 이름

/**
 * 챌린저스 월드가 아니면 "시즌 보스 메이린"은 안 보이게 걸러낸다.
 */
export function isBossVisibleForWorld(item, worldName) {
  const name = (item.contentName ?? '').replace(/\s/g, '')
  if (name === SEASON_BOSS_MAYRIN) {
    return CHALLENGERS_WORLDS.includes(worldName)
  }
  return true
}

/**
 * "시즌 보스 메이린"은 챌린저스 월드 한정 보너스 보스라, 주간 12마리 선택
 * 한도에는 포함하지 않는다(선택해도 다른 주간 보스를 고를 자리를 깎아먹지 않음).
 */
export function isWeeklyLimitExempt(bossName) {
  return (bossName ?? '').replace(/\s/g, '') === SEASON_BOSS_MAYRIN
}

/**
 * 보스 목록 - 이제 scheduler(API)가 아니라 엑셀 표를 근거로 만든다.
 * scheduler는 worldName(챌린저스 월드 판별용)만 참고로 쓴다.
 */
export function getValidBossContents(scheduler) {
  return getBossListFromTable().filter((b) => isBossVisibleForWorld(b, scheduler?.worldName))
}
