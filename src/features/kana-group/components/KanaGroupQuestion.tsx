import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { KanaGroupFeedback } from '../model/kanaGroupSession'
import type { KanaGroupQuestion as KanaGroupQuestionData } from '../model/types'
import { KanaGroupFeedback as FeedbackMessage } from './KanaGroupFeedback'

export type KanaGroupQuestionProps = {
  question: KanaGroupQuestionData
  selectedChoiceId: string | null
  feedback: KanaGroupFeedback
  onSelect: (choiceId: string) => void
}

export function KanaGroupQuestion({ question, selectedChoiceId, feedback, onSelect }: KanaGroupQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="kana-group-question" aria-label="かなの仲間分け問題">
      <h2 className="kana-group-question__target">{question.targetCharacter}</h2>
      <p className="kana-group-question__instruction">どの なかまか えらぼう</p>
      <div className="kana-group-question__choices" role="group" aria-label="かなのなかまをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="kana-group-choice"
            aria-label={`${choice.label}のなかま`}
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
