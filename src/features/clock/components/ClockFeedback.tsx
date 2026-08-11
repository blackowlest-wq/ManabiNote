import type { ClockFeedback as ClockFeedbackState } from '../model/clockSession'

export function ClockFeedback({ feedback }: { feedback: ClockFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p className={`clock-feedback clock-feedback--${isCorrect ? 'success' : 'retry'}`} role="status" aria-live="polite">
      {isCorrect ? 'せいかい！' : 'はりを もういちど みてみよう'}
    </p>
  )
}
