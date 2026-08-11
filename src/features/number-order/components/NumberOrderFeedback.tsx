import type { NumberOrderFeedback as NumberOrderFeedbackState } from '../model/numberOrderSession'

export function NumberOrderFeedback({ feedback }: { feedback: NumberOrderFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`number-order-feedback number-order-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
