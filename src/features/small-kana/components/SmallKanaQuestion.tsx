import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import { getMaskedSmallKanaWord } from '../model/smallKanaQuestion'
import type { SmallKanaFeedback } from '../model/smallKanaSession'
import type { SmallKanaQuestion as SmallKanaQuestionData } from '../model/types'
import { SmallKanaFeedback as FeedbackMessage } from './SmallKanaFeedback'

export type SmallKanaQuestionProps = {
  question: SmallKanaQuestionData
  selectedChoiceId: string | null
  feedback: SmallKanaFeedback
  onSelect: (choiceId: string) => void
}

export function SmallKanaQuestion({ question, selectedChoiceId, feedback, onSelect }: SmallKanaQuestionProps) {
  const isLocked = feedback === 'correct'
  const maskedWord = getMaskedSmallKanaWord(question)

  return (
    <section className="small-kana-question" aria-label="ちいさいかなの問題">
      <p className="small-kana-question__instruction">＿に はいる かなを えらぼう</p>
      <p className="small-kana-word" aria-label={`問題のことば ${maskedWord}`}>{maskedWord}</p>
      <div className="small-kana-question__choices" role="group" aria-label="ちいさいかなをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="small-kana-choice"
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
