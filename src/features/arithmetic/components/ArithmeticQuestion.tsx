import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { ArithmeticFeedback } from '../model/arithmeticSession'
import type { ArithmeticQuestion as ArithmeticQuestionData } from '../model/types'
import { ArithmeticFeedback as FeedbackMessage } from './ArithmeticFeedback'

export type ArithmeticQuestionProps = {
  question: ArithmeticQuestionData
  selectedChoiceId: string | null
  feedback: ArithmeticFeedback
  onSelect: (choiceId: string) => void
}

export function ArithmeticQuestion({ question, selectedChoiceId, feedback, onSelect }: ArithmeticQuestionProps) {
  const isLocked = feedback === 'correct'
  const symbol = question.kind === 'addition' ? '＋' : '−'

  return (
    <section className="arithmetic-question" aria-label={question.kind === 'addition' ? 'たしざんの問題' : 'ひきざんの問題'}>
      <p className="arithmetic-question__instruction">？に はいる かずは どれ？</p>
      <p className="arithmetic-expression" aria-label={`${question.left} ${symbol} ${question.right} は いくつ`}>
        <span>{question.left}</span>
        <span aria-hidden="true">{symbol}</span>
        <span>{question.right}</span>
        <span aria-hidden="true">＝</span>
        <span className="arithmetic-expression__answer">？</span>
      </p>
      <div className="arithmetic-question__choices" role="group" aria-label="こたえをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="arithmetic-choice"
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
