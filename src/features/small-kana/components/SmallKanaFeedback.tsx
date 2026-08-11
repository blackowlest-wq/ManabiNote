import type { SmallKanaFeedback as SmallKanaFeedbackState } from '../model/smallKanaSession'

export function SmallKanaFeedback({ feedback }: { feedback: SmallKanaFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`small-kana-feedback small-kana-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
