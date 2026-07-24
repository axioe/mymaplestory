/**
 * 백엔드(GlobalExceptionHandler)가 내려주는 error 코드를 사람이 이해할 수 있는
 * 문구로 바꿔준다. API_KEY_REQUIRED가 뜬다는 건 X-Nexon-Api-Key 헤더 없이
 * 요청이 나갔다는 뜻이라, "다시 시도" 대신 "홈에서 키를 다시 입력하라"고
 * 명확하게 안내한다.
 */
export function describeApiError(err, fallback) {
  const code = err?.response?.data?.error
  if (code === 'API_KEY_REQUIRED') {
    return 'API 키가 없습니다. 우측 상단 홈 버튼을 눌러 API 키를 다시 입력해주세요.'
  }
  if (code === 'INVALID_API_KEY') {
    return '유효하지 않은 API 키입니다. 다시 확인해주세요.'
  }
  return fallback
}
