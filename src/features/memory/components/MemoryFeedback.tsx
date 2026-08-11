import type { MemoryFeedback as MemoryFeedbackState } from '../model/memorySession'

export function MemoryFeedback({ feedback }: { feedback: MemoryFeedbackState }) {
  if (feedback === 'none') return null

  const isCorrect = feedback === 'correct'
  return (
    <p
      className={`memory-feedback memory-feedback--${isCorrect ? 'success' : 'retry'}`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? 'せいかい！' : 'ちがう くみあわせだよ。つぎのカードを えらぼう'}
    </p>
  )
}
