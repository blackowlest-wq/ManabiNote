import type { ShapePatternFeedback as ShapePatternFeedbackState } from '../model/shapePatternSession'

export function ShapePatternFeedback({ feedback }: { feedback: ShapePatternFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`shape-pattern-feedback shape-pattern-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'ならびを もういちど みてみよう'}
    </p>
  )
}
