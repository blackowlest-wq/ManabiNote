import type { KanaPairFeedback as KanaPairFeedbackState } from '../model/kanaPairSession'

export type KanaPairFeedbackProps = {
  feedback: KanaPairFeedbackState
}

export function KanaPairFeedback({ feedback }: KanaPairFeedbackProps) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`kana-pair-feedback kana-pair-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
