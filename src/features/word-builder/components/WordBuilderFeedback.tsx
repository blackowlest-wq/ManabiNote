import type { WordBuilderFeedback as WordBuilderFeedbackState } from '../model/wordBuilderSession'

export type WordBuilderFeedbackProps = {
  feedback: WordBuilderFeedbackState
}

export function WordBuilderFeedback({ feedback }: WordBuilderFeedbackProps) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`word-builder-feedback word-builder-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど'}
    </p>
  )
}
