import { useState } from 'react'
import TickDivider from '../../components/TickDivider.jsx'
import DateTimeLabel from '../../components/DateTimeLabel.jsx'
import '../../css/home-shared.css'
import '../../css/home-apikey.css'

/**
 * 입력창 값은 이 컴포넌트가 직접 들고 있고, 제출 시에만 부모에게 넘긴다
 * (부모는 검증/저장 같은 비동기 로직만 신경 쓰면 된다).
 */
const MAX_KEY_LENGTH = 200 // 넥슨 API 키는 보통 이보다 훨씬 짧다 - 이보다 길면 잘못 붙여넣은 것으로 간주

export default function ApiKeyPage({ onSubmit, checking, disabled, error }) {
  const [value, setValue] = useState('')
  const [localError, setLocalError] = useState(null)

  const handleChange = (e) => {
    setValue(e.target.value)
    if (localError) setLocalError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || checking) return

    if (trimmed.length > MAX_KEY_LENGTH) {
      // 헤더가 비정상적으로 커지면 서버(Tomcat)가 요청 자체를 거부해버려서,
      // 여기서 미리 걸러내는 게 훨씬 명확한 안내가 된다.
      setLocalError('API 키가 너무 깁니다. 잘못 붙여넣지 않았는지 확인해주세요.')
      return
    }
    onSubmit(trimmed)
  }

  return (
    <>
      <div className="home__datetime">
        <DateTimeLabel />
      </div>

      <div className="home__content">
        <p className="display home__my">MY</p>
        <div className="home__divider">
          <TickDivider width={300} />
        </div>
        <h1 className="display home__title">MAPLE STORY</h1>
        <div className="home__action-spacer" />

        <form onSubmit={handleSubmit} className="home__apikey-form">
          <input
            type="password"
            value={value}
            onChange={handleChange}
            placeholder="NEXON API KEY"
            className="home__apikey-input"
            autoComplete="off"
            maxLength={MAX_KEY_LENGTH}
            disabled={checking || disabled}
          />
          <button type="submit" className="home__apikey-submit" disabled={checking || disabled}>
            {checking ? '확인 중...' : '확인'}
          </button>
        </form>
        {(localError || error) && <p className="home__apikey-error">{localError || error}</p>}
        <p className="home__apikey-hint">
          넥슨 오픈 API(openapi.nexon.com)에서 발급받은 개인 API 키를 입력하면
          내 캐릭터 카드와 아카이브 카테고리를 볼 수 있어요. 이 브라우저에만 저장됩니다.
        </p>
        <p className="home__caption">HISTORY LINE FOR MY MAPLESTORY</p>
      </div>
    </>
  )
}
