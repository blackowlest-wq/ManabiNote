import type { ReadingComprehensionFeedback as ReadingComprehensionFeedbackState } from '../model/readingComprehensionSession'

export function ReadingComprehensionFeedback({ feedback }: { feedback: ReadingComprehensionFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`reading-comprehension-feedback reading-comprehension-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'ぶんを もういちど よんでみよう'}
    </p>
  )
}
