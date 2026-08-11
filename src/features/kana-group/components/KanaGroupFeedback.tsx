import type { KanaGroupFeedback as KanaGroupFeedbackState } from '../model/kanaGroupSession'

export function KanaGroupFeedback({ feedback }: { feedback: KanaGroupFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`kana-group-feedback kana-group-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
