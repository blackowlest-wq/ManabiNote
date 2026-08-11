import type { CountingFeedback as CountingFeedbackState } from '../model/countingSession'

export function CountingFeedback({ feedback }: { feedback: CountingFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`counting-feedback counting-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど かぞえてね'}
    </p>
  )
}
