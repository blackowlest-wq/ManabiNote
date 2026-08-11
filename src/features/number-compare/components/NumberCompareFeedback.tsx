import type { NumberCompareFeedback as NumberCompareFeedbackState } from '../model/numberCompareSession'

export function NumberCompareFeedback({ feedback }: { feedback: NumberCompareFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`number-compare-feedback number-compare-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
