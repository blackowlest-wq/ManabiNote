import type { KanjiChoiceFeedback as KanjiChoiceFeedbackState } from '../model/kanjiChoiceSession'

export function KanjiChoiceFeedback({ feedback }: { feedback: KanjiChoiceFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`kanji-choice-feedback kanji-choice-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
