import axios from 'axios'

const API_KEY_STORAGE_KEY = 'mms-nexon-api-key'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ApiKeyContext가 localStorage에 저장해둔 사용자의 넥슨 API 키를
// 매 요청마다 x-nxopen-api-key 헤더로 자동으로 실어 보낸다.
// (예전엔 우리 앱 자체 이름인 "X-Nexon-Api-Key"를 썼는데, 넥슨 서버로 나갈 때 쓰는
// 진짜 헤더 이름("x-nxopen-api-key")과 이름이 달라서 헷갈리는 일이 많아 통일했다.)
apiClient.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY)
  if (apiKey) {
    config.headers['x-nxopen-api-key'] = apiKey
  }
  return config
})

export async function fetchCharacterCard(characterName) {
  const { data } = await apiClient.get(`/characters/${encodeURIComponent(characterName)}/card`)
  return data
}

export async function fetchLevelHistory(characterName, days = 30) {
  const { data } = await apiClient.get(
    `/characters/${encodeURIComponent(characterName)}/level-history`,
    { params: { days } }
  )
  return data
}

export async function fetchNotices() {
  const { data } = await apiClient.get('/notices')
  return data
}

export async function fetchEventNotices() {
  const { data } = await apiClient.get('/notices/events')
  return data
}

export async function fetchScheduler(characterName) {
  const { data } = await apiClient.get(`/characters/${encodeURIComponent(characterName)}/scheduler`)
  return data
}

// ---- 보스 선택 (DB 저장) ----
export async function fetchBossSelections(characterName) {
  const { data } = await apiClient.get(`/characters/${encodeURIComponent(characterName)}/boss-selections`)
  return data
}

export async function upsertBossSelection(characterName, selection) {
  const { data } = await apiClient.put(
    `/characters/${encodeURIComponent(characterName)}/boss-selections`,
    selection
  )
  return data
}

export async function deleteBossSelection(characterName, bossName) {
  await apiClient.delete(
    `/characters/${encodeURIComponent(characterName)}/boss-selections/${encodeURIComponent(bossName)}`
  )
}

export async function resetBossSelections(characterName) {
  await apiClient.delete(`/characters/${encodeURIComponent(characterName)}/boss-selections`)
}

// ---- 스킵 체크 (DB 저장) ----
export async function fetchSkips(characterName) {
  const { data } = await apiClient.get(`/characters/${encodeURIComponent(characterName)}/skips`)
  return data
}

export async function setSkip(characterName, contentName, skipped) {
  await apiClient.put(
    `/characters/${encodeURIComponent(characterName)}/skips/${encodeURIComponent(contentName)}`,
    { contentName, skipped }
  )
}

// 아직 localStorage에 저장되지 않은 키를 검증할 때 쓰므로,
// 인터셉터에 기대지 않고 헤더를 직접 지정한다.
export async function validateApiKey(apiKey) {
  const { data } = await apiClient.post(
    '/auth/validate-key',
    null,
    { headers: { 'x-nxopen-api-key': apiKey } }
  )
  return data
}
