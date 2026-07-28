import { lookupBossCycle } from '../data/bossCycleData.js'

/**
 * 넥슨 API의 cycle 필드가 실제로 부정확한 경우가 있어서, 사용자가 정리해준
 * 참고표(bossCycleData)를 우선 쓰고, 표에 없는 조합만 API의 cycle 값으로 대체한다.
 */
export function resolveBossCycle(item) {
  const fromTable = lookupBossCycle(item.contentName, item.difficulty)
  if (fromTable) return fromTable.cycle
  if ((item.cycle ?? '').includes('월')) return 'monthly'
  if ((item.cycle ?? '').includes('주')) return 'weekly'
  return 'daily'
}

export function resolveBossPrice(item) {
  return lookupBossCycle(item.contentName, item.difficulty)?.price ?? null
}

export function formatMeso(price) {
  return price == null ? null : `${Math.floor(price).toLocaleString('ko-KR')}메소`
}

/**
 * 넥슨 응답에 실제로 존재하지 않는(또는 잘못 내려오는) 조합을 걸러낸다.
 * - 가디언 엔젤 슬라임은 실제로 chaos 난이도가 없는데 API에 섞여 나와서 제외.
 */
export function isInvalidBossEntry(item) {
  const name = (item.contentName ?? '').replace(/\s/g, '')
  const difficulty = (item.difficulty ?? '').toLowerCase()
  if (name === '가디언엔젤슬라임' && difficulty === 'chaos') return true
  return false
}

// 챌린저스 월드(챌린저스1~4)에서만 등장하는 시즌 전용 보스.
const CHALLENGERS_WORLDS = ['챌린저스1', '챌린저스2', '챌린저스3', '챌린저스4']
const CHALLENGERS_ONLY_BOSS = '시즌보스메이린'

/**
 * 챌린저스 월드가 아니면 "시즌 보스 메이린"은 안 보이게 걸러낸다.
 */
export function isBossVisibleForWorld(item, worldName) {
  const name = (item.contentName ?? '').replace(/\s/g, '')
  if (name === CHALLENGERS_ONLY_BOSS) {
    return CHALLENGERS_WORLDS.includes(worldName)
  }
  return true
}

export function getValidBossContents(scheduler) {
  return (scheduler?.bossContents ?? [])
    .filter((b) => !isInvalidBossEntry(b))
    .filter((b) => isBossVisibleForWorld(b, scheduler?.worldName))
}
