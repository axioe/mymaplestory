import { useEffect, useState } from 'react'
import '../css/datetime-label.css'

function format(date) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} ${days[date.getDay()]}`
}

export default function DateTimeLabel() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    // 시간은 더 이상 표시하지 않으므로 자정에 한 번씩만 갱신되면 충분하지만,
    // 구현을 간단히 하기 위해 10분 간격으로 날짜만 다시 계산한다.
    const id = setInterval(() => setNow(new Date()), 10 * 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="datetime-label">
      {format(now)}
    </span>
  )
}
