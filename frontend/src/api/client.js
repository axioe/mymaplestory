import axios from 'axios'

const API_KEY_STORAGE_KEY = 'mms-nexon-api-key'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ApiKeyContext가 localStorage에 저장해둔 사용자의 넥슨 API 키를
// 매 요청마다 X-Nexon-Api-Key 헤더로 자동으로 실어 보낸다.
apiClient.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY)
  if (apiKey) {
    config.headers['X-Nexon-Api-Key'] = apiKey
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

// 아직 localStorage에 저장되지 않은 키를 검증할 때 쓰므로,
// 인터셉터에 기대지 않고 헤더를 직접 지정한다.
export async function validateApiKey(apiKey) {
  const { data } = await apiClient.post(
    '/auth/validate-key',
    null,
    { headers: { 'X-Nexon-Api-Key': apiKey } }
  )
  return data
}
