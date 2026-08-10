import type { MissingCharacterFeedback as MissingCharacterFeedbackState } from '../model/missingCharacterSession'

export type MissingCharacterFeedbackProps = {
  feedback: MissingCharacterFeedbackState
}

export function MissingCharacterFeedback({ feedback }: MissingCharacterFeedbackProps) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`missing-character-feedback missing-character-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
