import type { ArithmeticFeedback as ArithmeticFeedbackState } from '../model/arithmeticSession'

export function ArithmeticFeedback({ feedback }: { feedback: ArithmeticFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`arithmetic-feedback arithmetic-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど かんがえてみよう'}
    </p>
  )
}
