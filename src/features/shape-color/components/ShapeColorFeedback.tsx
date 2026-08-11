import type { ShapeColorFeedback as ShapeColorFeedbackState } from '../model/shapeColorSession'

export function ShapeColorFeedback({ feedback }: { feedback: ShapeColorFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`shape-color-feedback shape-color-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
