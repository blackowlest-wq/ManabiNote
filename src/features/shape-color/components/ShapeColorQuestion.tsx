import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { ShapeColorFeedback } from '../model/shapeColorSession'
import type { ShapeColorQuestion as ShapeColorQuestionData, ShapeColorChoice, ShapeColor } from '../model/types'
import { ShapeColorFeedback as FeedbackMessage } from './ShapeColorFeedback'

const shapeLabels: Record<ShapeColorChoice['shape'], string> = {
  circle: 'まる',
  triangle: 'さんかく',
  square: 'しかく',
  star: 'ほし',
}

const colorLabels: Record<ShapeColor, string> = {
  red: 'あか',
  blue: 'あお',
  yellow: 'きいろ',
  green: 'みどり',
}

const choiceLabel = (choice: ShapeColorChoice) => `${colorLabels[choice.color]}の${shapeLabels[choice.shape]}`

export type ShapeColorQuestionProps = {
  question: ShapeColorQuestionData
  selectedChoiceId: string | null
  feedback: ShapeColorFeedback
  onSelect: (choiceId: string) => void
}

export function ShapeColorQuestion({ question, selectedChoiceId, feedback, onSelect }: ShapeColorQuestionProps) {
  const isLocked = feedback === 'correct'
  const target = {
    id: 'target',
    shape: question.targetShape,
    color: question.targetColor,
  } satisfies ShapeColorChoice

  return (
    <section className="shape-color-question" aria-label="いろとかたちの問題">
      <p className="shape-color-question__instruction">おなじ いろと かたちは どれ？</p>
      <div className="shape-color-target" role="img" aria-label={choiceLabel(target)}>
        <span className={`shape-color-icon shape-color-icon--${target.shape} shape-color-icon--${target.color}`} aria-hidden="true" />
      </div>
      <div className="shape-color-question__choices" role="group" aria-label="おなじいろとかたちをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="shape-color-choice"
            aria-label={choiceLabel(choice)}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            <span className={`shape-color-icon shape-color-icon--${choice.shape} shape-color-icon--${choice.color}`} aria-hidden="true" />
            <span aria-hidden="true">{choiceLabel(choice)}</span>
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
