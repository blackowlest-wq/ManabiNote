import type { AudioKanaFeedback as AudioKanaFeedbackState } from '../model/audioKanaSession'

export function AudioKanaFeedback({ feedback }: { feedback: AudioKanaFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`audio-kana-feedback audio-kana-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど えらんでね'}
    </p>
  )
}
