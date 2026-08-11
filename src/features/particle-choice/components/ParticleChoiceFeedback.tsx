import type { ParticleChoiceFeedback as ParticleChoiceFeedbackState } from '../model/particleChoiceSession'

export function ParticleChoiceFeedback({ feedback }: { feedback: ParticleChoiceFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`particle-choice-feedback particle-choice-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'もういちど よんでみよう'}
    </p>
  )
}
