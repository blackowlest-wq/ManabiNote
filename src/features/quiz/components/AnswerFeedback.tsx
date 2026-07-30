export type AnswerFeedbackProps = {
  isCorrect: boolean
  correctLabel: string
}

export function AnswerFeedback({ isCorrect, correctLabel }: AnswerFeedbackProps) {
  return (
    <div className="choice-feedback" role="status" aria-live="polite">
      {isCorrect ? (
        <p><span aria-hidden="true">✅</span> <span>正解！</span></p>
      ) : (
        <p><span aria-hidden="true">❌</span> <span>不正解。</span> 正しい答え: {correctLabel}</p>
      )}
    </div>
  )
}
