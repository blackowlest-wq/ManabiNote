import { SpriteImage } from '../../question-types/kana-to-picture/components/SpriteImage'
import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { CountingFeedback } from '../model/countingSession'
import type { CountingQuestion as CountingQuestionData } from '../model/types'
import { CountingFeedback as FeedbackMessage } from './CountingFeedback'

export type CountingQuestionProps = {
  question: CountingQuestionData
  selectedChoiceId: string | null
  feedback: CountingFeedback
  onSelect: (choiceId: string) => void
}

export function CountingQuestion({ question, selectedChoiceId, feedback, onSelect }: CountingQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="counting-question" aria-label="かずをかぞえる問題">
      <p className="counting-question__instruction">いくつ あるかな？</p>
      <div className="counting-items" role="group" aria-label={`${question.label}が ${question.count}こ`}>
        {Array.from({ length: question.count }, (_, index) => (
          <SpriteImage key={`${question.id}-item-${index}`} image={question.image} alt={question.label} width={92} height={92} />
        ))}
      </div>
      <div className="counting-question__choices" role="group" aria-label="かずをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="counting-choice"
            aria-label={`${choice.count}こ`}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {choice.count}
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
