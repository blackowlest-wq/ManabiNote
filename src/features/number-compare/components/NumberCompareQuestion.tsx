import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { NumberCompareFeedback } from '../model/numberCompareSession'
import type { NumberCompareQuestion as NumberCompareQuestionData } from '../model/types'
import { NumberCompareFeedback as FeedbackMessage } from './NumberCompareFeedback'

export type NumberCompareQuestionProps = {
  question: NumberCompareQuestionData
  selectedChoiceId: string | null
  feedback: NumberCompareFeedback
  onSelect: (choiceId: string) => void
}

export function NumberCompareQuestion({ question, selectedChoiceId, feedback, onSelect }: NumberCompareQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="number-compare-question" aria-label="かずをくらべる問題">
      <p className="number-compare-question__instruction">おおきい かずは どれ？</p>
      <div className="number-compare-values" role="group" aria-label="くらべる かず">
        <span className="number-compare-value">{question.left}</span>
        <span className="number-compare-versus" aria-hidden="true">と</span>
        <span className="number-compare-value">{question.right}</span>
      </div>
      <div className="number-compare-question__choices" role="group" aria-label="おおきいかずをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="number-compare-choice"
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
