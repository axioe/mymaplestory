import { useTheme } from '../../ThemeContext.jsx'
import '../../css/home-shared.css'

/**
 * 표지 전체를 이미지(ChatGPT로 만든 "MY MAPLE STORY" 일러스트, public/cover.png)로
 * 깔고, 그 위에 "시작하기" 버튼만 얹는다. 예전엔 텍스트(MY/MAPLE STORY/캡션)를
 * 코드로 직접 그렸는데, 이제 그 텍스트가 이미지 안에 이미 그려져 있어서
 * 코드에서는 다시 안 그린다. 다크모드일 때는 밤 버전 표지(cover-dark.png)로 바뀐다.
 */
export default function StartPage({ onStart, disabled }) {
  const { theme } = useTheme()
  const coverImage = theme === 'dark' ? '/cover-dark.png' : '/cover.png'

  return (
    <div className="home__cover">
      <img src={coverImage} alt="MY MAPLE STORY" className="home__cover-image" />
      <button onClick={onStart} className="home__apikey-submit home__cover-start" disabled={disabled}>
        시작하기
      </button>
    </div>
  )
}
