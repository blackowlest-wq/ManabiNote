import type { DakutenFeedback as DakutenFeedbackState } from '../model/dakutenSession'

export function DakutenFeedback({ feedback }: { feedback: DakutenFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`dakuten-feedback dakuten-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
