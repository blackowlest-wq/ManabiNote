import type { ShiritoriFeedback as ShiritoriFeedbackState } from '../model/shiritoriSession'

export function ShiritoriFeedback({ feedback }: { feedback: ShiritoriFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`shiritori-feedback shiritori-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
