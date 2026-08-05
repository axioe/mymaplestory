import { useTheme } from '../../../ThemeContext.jsx'
import '../../../css/home-shared.css'

/**
 * API 키 페이지(오른쪽 슬롯 = ApiKeyPage)와 짝을 이루는 왼쪽 슬롯 전용 배경.
 *
 * 다른 페이지들의 왼쪽 슬롯은 특별한 콘텐츠가 없으면 book-flip-stage.css의
 * 공용 .flip-page--left 배경(page-left.png)을 그대로 쓰지만, API 키 페이지는
 * 원래 하나의 스프레드 그림(왼쪽 = 책+열쇠 일러스트, 오른쪽 = "NEXON API KEY"
 * 입력칸)으로 같이 디자인된 이미지라, 공용 배경을 쓰면 왼쪽과 오른쪽이
 * 서로 다른 그림처럼 어긋나 보인다. 그래서 apikey.png와 짝이 되는
 * apikey-left.png(같은 스프레드의 왼쪽 절반)를 여기서 별도로 깐다.
 */
export default function ApiKeyLeftPage() {
  const { theme } = useTheme()
  const leftImage = theme === 'dark' ? '/apikey-left-dark.png' : '/apikey-left.png'

  return (
    <div className="home__cover">
      <img src={leftImage} alt="" className="home__cover-image home__cover-image--spring-left" />
    </div>
  )
}
