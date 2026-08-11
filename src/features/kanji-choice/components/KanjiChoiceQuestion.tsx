import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { KanjiChoiceFeedback } from '../model/kanjiChoiceSession'
import type { KanjiChoiceQuestion as KanjiChoiceQuestionData } from '../model/types'
import { KanjiChoiceFeedback as FeedbackMessage } from './KanjiChoiceFeedback'

export type KanjiChoiceQuestionProps = {
  question: KanjiChoiceQuestionData
  selectedChoiceId: string | null
  feedback: KanjiChoiceFeedback
  onSelect: (choiceId: string) => void
}

export function KanjiChoiceQuestion({ question, selectedChoiceId, feedback, onSelect }: KanjiChoiceQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="kanji-choice-question" aria-label="よみから かんじを選ぶ問題">
      <p className="kanji-choice-question__instruction">この よみかたの かんじは どれ？</p>
      <p className="kanji-choice-reading" aria-label={`よみかた ${question.reading}`}>{question.reading}</p>
      <div className="kanji-choice-question__choices" role="group" aria-label="かんじをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="kanji-choice-option"
            aria-label={choice.kanji}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {choice.kanji}
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
