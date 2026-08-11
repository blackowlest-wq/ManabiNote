import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { ClockFeedback } from '../model/clockSession'
import type { ClockQuestion as ClockQuestionData } from '../model/types'
import { ClockFace } from './ClockFace'
import { ClockFeedback as FeedbackMessage } from './ClockFeedback'

export type ClockQuestionProps = {
  question: ClockQuestionData
  selectedChoiceId: string | null
  feedback: ClockFeedback
  onSelect: (choiceId: string) => void
}

export function ClockQuestion({ question, selectedChoiceId, feedback, onSelect }: ClockQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="clock-question" aria-label="とけいの問題">
      <p className="clock-question__instruction">なんじ なんぷん？</p>
      <ClockFace hour={question.hour} minute={question.minute} />
      <div className="clock-question__choices" role="group" aria-label="じこくをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="clock-choice"
            aria-label={choice.label}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {choice.label}
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
