import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import { getShapePatternLabel } from '../model/shapePatternQuestion'
import type { ShapePatternFeedback } from '../model/shapePatternSession'
import type { ShapePatternQuestion as ShapePatternQuestionData } from '../model/types'
import { ShapePatternFeedback as FeedbackMessage } from './ShapePatternFeedback'

export type ShapePatternQuestionProps = {
  question: ShapePatternQuestionData
  selectedChoiceId: string | null
  feedback: ShapePatternFeedback
  onSelect: (choiceId: string) => void
}

export function ShapePatternQuestion({ question, selectedChoiceId, feedback, onSelect }: ShapePatternQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="shape-pattern-question" aria-label="かたちの ならび問題">
      <p className="shape-pattern-question__instruction">つぎに くるのは どれ？</p>
      <div className="shape-pattern-sequence" role="group" aria-label="かたちの ならび">
        {question.sequence.map((value, index) => (
          <span key={`${question.id}-token-${index}`} className="shape-pattern-token" role="img" aria-label={getShapePatternLabel(value)}>
            <span className={`shape-color-icon shape-color-icon--${value.shape} shape-color-icon--${value.color}`} aria-hidden="true" />
          </span>
        ))}
        <span className="shape-pattern-token shape-pattern-token--missing" aria-label="つぎの かたち">？</span>
      </div>
      <div className="shape-pattern-question__choices" role="group" aria-label="つぎのかたちをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="shape-pattern-choice"
            aria-label={getShapePatternLabel(choice)}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {getShapePatternLabel(choice)}
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
