import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import '../../../css/home-archive-shared.css'

/**
 * date를 "MM/DD"로 줄여서 x축에 보여준다 - history의 date는 백엔드가
 * LocalDate.toString()(YYYY-MM-DD)으로 내려주므로 앞 5글자만 잘라내면 된다.
 */
const formatTick = (date) => (typeof date === 'string' ? date.slice(5) : date)

/**
 * recharts 기본 툴팁은 흰 배경 카드라 책 페이지 질감과 안 어울려서, 색을 전부
 * CSS 변수로 지정한 커스텀 툴팁으로 바꾼다 - 다크모드에서도 자동으로 맞는 색을 쓴다.
 */
function LevelTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="home__level-chart-tooltip">
      <p className="home__level-chart-tooltip-date">{label}</p>
      <p className="home__level-chart-tooltip-level">Lv.{point.level}</p>
      {point.expRate != null && (
        <p className="home__level-chart-tooltip-exp">경험치 {Number(point.expRate).toFixed(2)}%</p>
      )}
    </div>
  )
}

/**
 * 레벨 진척도 차트 - NexonApiService.getLevelHistory()가 레벨업 날짜를 찾으려고
 * 하루씩 거슬러 조회한 날짜별 (날짜, 레벨, 경험치%) 기록을, 경험치% 기준으로
 * 선 그래프로 보여준다(레벨 숫자보다 날짜 사이 변화가 더 잘 보여서). 레벨
 * 자체는 툴팁에서 여전히 같이 확인할 수 있다.
 *
 * 넥슨 API가 실제로 조회를 허용하는 과거 기간이 짧아서(며칠 정도로 추정),
 * history가 2개 미만이면 선을 그릴 수 없으므로 아예 렌더링하지 않는다 - 호출부
 * (ArchivePage)에서 그 경우엔 기존 요약 텍스트만 보여준다.
 */
export default function LevelProgressChart({ history }) {
  if (!history || history.length < 2) return null

  return (
    <div className="home__level-chart">
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={history} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            tick={{ fontSize: 10, fill: 'var(--color-ink)' }}
            axisLine={{ stroke: 'var(--color-line)' }}
            tickLine={false}
          />
          <YAxis
            dataKey="expRate"
            width={38}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'var(--color-ink)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<LevelTooltip />} />
          <Line
            type="monotone"
            dataKey="expRate"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--color-accent)', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
