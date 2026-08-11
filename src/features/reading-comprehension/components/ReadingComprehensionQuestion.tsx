import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { ReadingComprehensionFeedback } from '../model/readingComprehensionSession'
import type { ReadingComprehensionQuestion as ReadingComprehensionQuestionData } from '../model/types'
import { ReadingComprehensionFeedback as FeedbackMessage } from './ReadingComprehensionFeedback'

export type ReadingComprehensionQuestionProps = {
  question: ReadingComprehensionQuestionData
  selectedChoiceId: string | null
  feedback: ReadingComprehensionFeedback
  onSelect: (choiceId: string) => void
}

export function ReadingComprehensionQuestion({
  question,
  selectedChoiceId,
  feedback,
  onSelect,
}: ReadingComprehensionQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="reading-comprehension-question" aria-label="ぶんを よむ問題">
      <p className="reading-comprehension-question__instruction">ぶんを よんで こたえよう</p>
      <p className="reading-comprehension-passage">{question.passage}</p>
      <p className="reading-comprehension-prompt">{question.prompt}</p>
      <div className="reading-comprehension-question__choices" role="group" aria-label="こたえをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="reading-comprehension-choice"
            aria-label={choice.text}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {choice.text}
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
