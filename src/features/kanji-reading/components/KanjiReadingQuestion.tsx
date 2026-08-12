import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { KanjiReadingFeedback } from '../model/kanjiReadingSession'
import type { KanjiReadingQuestion as KanjiReadingQuestionData } from '../model/types'
import { KanjiReadingFeedback as FeedbackMessage } from './KanjiReadingFeedback'

export type KanjiReadingQuestionProps = {
  question: KanjiReadingQuestionData
  selectedChoiceId: string | null
  feedback: KanjiReadingFeedback
  onSelect: (choiceId: string) => void
}

export function KanjiReadingQuestion({ question, selectedChoiceId, feedback, onSelect }: KanjiReadingQuestionProps) {
  const isLocked = feedback === 'correct'
  const targetIndex = question.word.indexOf(question.kanji)
  const beforeTarget = question.word.slice(0, targetIndex)
  const afterTarget = question.word.slice(targetIndex + question.kanji.length)
  const isSingleKanji = question.word === question.kanji

  return (
    <section className="kanji-reading-question" aria-label="かんじの よみかた問題">
      <p className="kanji-reading-question__instruction">この ことばの よみかたは どれ？</p>
      <p
        className={`kanji-reading-character kanji-reading-word${isSingleKanji ? ' kanji-reading-word--single' : ''}`}
        aria-label={`ことば ${question.word}、よむ かんじ ${question.kanji}`}
      >
        {beforeTarget}
        <span className="kanji-reading-word__target" aria-label={`よむ かんじ ${question.kanji}`}>{question.kanji}</span>
        {afterTarget}
      </p>
      <div className="kanji-reading-question__choices" role="group" aria-label="よみかたをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="kanji-reading-choice"
            aria-label={choice.reading}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {choice.reading}
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
