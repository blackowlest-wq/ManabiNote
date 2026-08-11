import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { DakutenFeedback } from '../model/dakutenSession'
import type { DakutenQuestion as DakutenQuestionData } from '../model/types'
import { DakutenFeedback as FeedbackMessage } from './DakutenFeedback'

export type DakutenQuestionProps = {
  question: DakutenQuestionData
  selectedChoiceId: string | null
  feedback: DakutenFeedback
  onSelect: (choiceId: string) => void
}

export function DakutenQuestion({ question, selectedChoiceId, feedback, onSelect }: DakutenQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="dakuten-question" aria-label="てんてんとまるの問題">
      <div className="dakuten-prompt" aria-label={`${question.baseCharacter}に${question.mark}`}>
        <span className="dakuten-prompt__base">{question.baseCharacter}</span>
        <span className="dakuten-prompt__mark">{question.mark}</span>
      </div>
      <p className="dakuten-question__instruction">てんてんや まるを つけた もじを えらぼう</p>
      <div className="dakuten-question__choices" role="group" aria-label="こたえをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="dakuten-choice"
            aria-label={choice.character}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {choice.character}
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
