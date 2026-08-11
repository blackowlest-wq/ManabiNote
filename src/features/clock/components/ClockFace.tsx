import { formatClockTime, getClockHandPoints } from '../model/clockQuestion'

export function ClockFace({ hour, minute }: { hour: number; minute: number }) {
  const hands = getClockHandPoints(hour, minute)
  const ticks = Array.from({ length: 12 }, (_, index) => {
    const angle = index * 30 * Math.PI / 180
    return {
      x1: 100 + Math.sin(angle) * 82,
      y1: 100 - Math.cos(angle) * 82,
      x2: 100 + Math.sin(angle) * 89,
      y2: 100 - Math.cos(angle) * 89,
    }
  })

  return (
    <svg className="clock-face" viewBox="0 0 200 200" role="img" aria-label={`とけい ${formatClockTime({ hour, minute })}`}>
      <circle className="clock-face__background" cx="100" cy="100" r="94" />
      {ticks.map((tick, index) => (
        <line key={index} className="clock-face__tick" {...tick} />
      ))}
      <text className="clock-face__number" x="100" y="30">12</text>
      <text className="clock-face__number" x="171" y="106">3</text>
      <text className="clock-face__number" x="100" y="181">6</text>
      <text className="clock-face__number" x="29" y="106">9</text>
      <line className="clock-face__hand clock-face__hand--hour" x1="100" y1="100" x2={hands.hour.x} y2={hands.hour.y} />
      <line className="clock-face__hand clock-face__hand--minute" x1="100" y1="100" x2={hands.minute.x} y2={hands.minute.y} />
      <circle className="clock-face__center" cx="100" cy="100" r="5" />
    </svg>
  )
}
