import { useState } from 'react'
import TickDivider from '../../components/TickDivider.jsx'
import DateTimeLabel from '../../components/DateTimeLabel.jsx'
import '../../css/home-shared.css'
import '../../css/home-apikey.css'

/**
 * 입력창 값은 이 컴포넌트가 직접 들고 있고, 제출 시에만 부모에게 넘긴다
 * (부모는 검증/저장 같은 비동기 로직만 신경 쓰면 된다).
 */
export default function ApiKeyPage({ onSubmit, checking, disabled, error }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim() || checking) return
    onSubmit(value)
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
            onChange={(e) => setValue(e.target.value)}
            placeholder="NEXON API KEY"
            className="home__apikey-input"
            autoComplete="off"
            disabled={checking || disabled}
          />
          <button type="submit" className="home__apikey-submit" disabled={checking || disabled}>
            {checking ? '확인 중...' : '확인'}
          </button>
        </form>
        {error && <p className="home__apikey-error">{error}</p>}
        <p className="home__apikey-hint">
          넥슨 오픈 API(openapi.nexon.com)에서 발급받은 개인 API 키를 입력하면
          내 캐릭터 카드와 아카이브 카테고리를 볼 수 있어요. 이 브라우저에만 저장됩니다.
        </p>
        <p className="home__caption">HISTORY LINE FOR MY MAPLESTORY</p>
      </div>
    </>
  )
}
