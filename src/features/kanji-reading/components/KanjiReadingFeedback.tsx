import type { KanjiReadingFeedback as KanjiReadingFeedbackState } from '../model/kanjiReadingSession'

export function KanjiReadingFeedback({ feedback }: { feedback: KanjiReadingFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`kanji-reading-feedback kanji-reading-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
