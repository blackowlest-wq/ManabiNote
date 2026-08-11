import type { SentenceOrderFeedback as SentenceOrderFeedbackState } from '../model/sentenceOrderSession'

export function SentenceOrderFeedback({ feedback }: { feedback: SentenceOrderFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`sentence-order-feedback sentence-order-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'じゅんばんを なおしてみよう'}
    </p>
  )
}
