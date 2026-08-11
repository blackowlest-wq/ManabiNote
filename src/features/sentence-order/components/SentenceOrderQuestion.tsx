import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { SentenceOrderFeedback } from '../model/sentenceOrderSession'
import type { SentenceOrderQuestion as SentenceOrderQuestionData } from '../model/types'
import { SentenceOrderFeedback as FeedbackMessage } from './SentenceOrderFeedback'

export type SentenceOrderQuestionProps = {
  question: SentenceOrderQuestionData
  selectedChoiceIds: readonly string[]
  feedback: SentenceOrderFeedback
  onSelect: (choiceId: string) => void
  onUndo: () => void
  onSubmit: () => void
}

export function SentenceOrderQuestion({
  question,
  selectedChoiceIds,
  feedback,
  onSelect,
  onUndo,
  onSubmit,
}: SentenceOrderQuestionProps) {
  const isLocked = feedback === 'correct'
  const selectedWords = selectedChoiceIds
    .map((choiceId) => question.choices.find((choice) => choice.id === choiceId)?.word)
    .filter((word): word is string => Boolean(word))

  return (
    <section className="sentence-order-question" aria-label="ぶんをつくる問題">
      <p className="sentence-order-question__instruction">ことばを ならべて ぶんを つくろう</p>
      <p className="sentence-order-selected" role="status" aria-label="できあがったぶん">
        {selectedWords.length ? selectedWords.join(' ') : 'ここに ことばが はいるよ'}
      </p>
      <div className="sentence-order-question__choices" role="group" aria-label="ことばをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="sentence-order-choice"
            aria-label={choice.word}
            aria-pressed={selectedChoiceIds.includes(choice.id)}
            disabled={isLocked || selectedChoiceIds.includes(choice.id)}
            onClick={() => onSelect(choice.id)}
          >
            {choice.word}
          </PrimaryButton>
        ))}
      </div>
      <div className="sentence-order-actions">
        <PrimaryButton
          className="sentence-order-undo"
          aria-label="もどす"
          disabled={isLocked || selectedChoiceIds.length === 0}
          onClick={onUndo}
        >
          もどす
        </PrimaryButton>
        <PrimaryButton
          className="sentence-order-submit"
          aria-label="こたえあわせ"
          disabled={isLocked || selectedChoiceIds.length === 0}
          onClick={onSubmit}
        >
          こたえあわせ
        </PrimaryButton>
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
