import TickDivider from '../../components/TickDivider.jsx'
import '../../css/home-shared.css'

export default function StartPage({ onStart, disabled }) {
  return (
    <div className="home__content">
      <p className="display home__my">MY</p>
      <div className="home__divider">
        <TickDivider width={300} />
      </div>
      <h1 className="display home__title">MAPLE STORY</h1>
      <div className="home__action-spacer" />
      <button onClick={onStart} className="home__apikey-submit" disabled={disabled}>
        시작하기
      </button>
      <p className="home__caption">HISTORY LINE FOR MY MAPLESTORY</p>
    </div>
  )
}
