import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { NumberOrderFeedback } from '../model/numberOrderSession'
import type { NumberOrderQuestion as NumberOrderQuestionData } from '../model/types'
import { NumberOrderFeedback as FeedbackMessage } from './NumberOrderFeedback'

export type NumberOrderQuestionProps = {
  question: NumberOrderQuestionData
  selectedChoiceId: string | null
  feedback: NumberOrderFeedback
  onSelect: (choiceId: string) => void
}

export function NumberOrderQuestion({ question, selectedChoiceId, feedback, onSelect }: NumberOrderQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="number-order-question" aria-label="かずの じゅんばん問題">
      <p className="number-order-question__instruction">？に はいる かずは どれ？</p>
      <div className="number-order-sequence" role="group" aria-label="かずの じゅんばん">
        {question.sequence.map((value, index) => (
          <span key={`${question.id}-sequence-${index}`} className={`number-order-value${value === null ? ' number-order-value--missing' : ''}`}>
            {value === null ? '？' : value}
          </span>
        ))}
      </div>
      <div className="number-order-question__choices" role="group" aria-label="つぎのかずをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="number-order-choice"
            aria-label={String(choice.value)}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {choice.value}
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
