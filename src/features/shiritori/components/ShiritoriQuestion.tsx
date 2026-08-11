import { SpriteImage } from '../../question-types/kana-to-picture/components/SpriteImage'
import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { ShiritoriFeedback } from '../model/shiritoriSession'
import type { ShiritoriQuestion as ShiritoriQuestionData } from '../model/types'
import { ShiritoriFeedback as FeedbackMessage } from './ShiritoriFeedback'

export type ShiritoriQuestionProps = {
  question: ShiritoriQuestionData
  selectedChoiceId: string | null
  feedback: ShiritoriFeedback
  onSelect: (choiceId: string) => void
}

export function ShiritoriQuestion({ question, selectedChoiceId, feedback, onSelect }: ShiritoriQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="shiritori-question" aria-label="しりとり問題">
      <p className="shiritori-question__instruction">この ことばの つぎは どれ？</p>
      <div className="shiritori-previous-card">
        <SpriteImage image={question.previousImage} alt={`${question.previousWord}のえ`} width={150} height={150} />
        <span>{question.previousWord}</span>
      </div>
      <p className="shiritori-arrow" aria-hidden="true">つぎは ↓</p>
      <div className="shiritori-question__choices" role="group" aria-label="つぎのことばをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="shiritori-choice"
            aria-label={choice.label}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            <SpriteImage image={choice.image} alt={`${choice.label}のえ`} width={112} height={112} />
            <span>{choice.label}</span>
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
