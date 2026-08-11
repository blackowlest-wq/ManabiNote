import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { KanaPairFeedback } from '../model/kanaPairSession'
import type { KanaPairQuestion as KanaPairQuestionData } from '../model/types'
import { KanaPairFeedback as FeedbackMessage } from './KanaPairFeedback'

export type KanaPairQuestionProps = {
  question: KanaPairQuestionData
  selectedChoiceId: string | null
  feedback: KanaPairFeedback
  onSelect: (choiceId: string) => void
}

export function KanaPairQuestion({
  question,
  selectedChoiceId,
  feedback,
  onSelect,
}: KanaPairQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="kana-pair-question" aria-label="ひらがなとカタカナの問題">
      <h2 className="kana-pair-question__hiragana">{question.hiragana}</h2>
      <p className="kana-pair-question__instruction">おなじ おとの カタカナを えらぼう</p>
      <div className="kana-pair-question__choices" role="group" aria-label="カタカナをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="kana-pair-choice"
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
